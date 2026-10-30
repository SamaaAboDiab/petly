import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, Loader2, MessageCircleOff } from 'lucide-react';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from '@/components/layout/UserAvatar';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import SmartImage from '@/components/ui/SmartImage';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useToast } from '@/context/ToastContext';
import { formatDayLabel, formatPrice } from '@/lib/format';
import { chatService } from '@/services/chatService';
import ChatComposer from './ChatComposer';
import MessageBubble from './MessageBubble';

const NEAR_BOTTOM_PX = 80;
const TYPING_VISIBLE_MS = 3000;
const EMPTY = { conversation: null, messages: [], hasMore: false, loading: true, error: null };

let tempCounter = 0;

function ThreadSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-5">
      {[60, 40, 70, 35, 55].map((width, i) => (
        <div key={i} className={i % 2 ? 'flex justify-end' : 'flex'}>
          <Skeleton className="h-12" rounded="rounded-3xl" style={{ width: `${width}%` }} />
        </div>
      ))}
    </div>
  );
}

function TypingDots() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex">
      <div className="flex gap-1 rounded-3xl rounded-bl-lg border border-line bg-surface px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-muted"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function ChatThread({ conversationId }) {
  const { user } = useAuth();
  const { socket, markRead } = useChat();
  const toast = useToast();
  const [thread, setThread] = useState(EMPTY);
  // Messages I sent that the server hasn't confirmed yet (or that failed).
  const [outbox, setOutbox] = useState([]);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);

  const addMessage = useCallback(
    (message) =>
      // The same message can arrive from the POST response and the socket.
      setThread((t) => (t.messages.some((m) => m.id === message.id) ? t : { ...t, messages: [...t.messages, message] })),
    [],
  );

  // Load the latest page whenever the conversation changes.
  useEffect(() => {
    let cancelled = false;
    setThread(EMPTY);
    setOutbox([]);
    setOtherTyping(false);
    stickToBottom.current = true;

    chatService
      .messages(conversationId)
      .then((data) => {
        if (cancelled) return;
        setThread({ ...data, loading: false, error: null });
        markRead(conversationId);
      })
      .catch((error) => !cancelled && setThread({ ...EMPTY, loading: false, error }));

    return () => {
      cancelled = true;
    };
  }, [conversationId, markRead]);

  // Live updates for this conversation only.
  useEffect(() => {
    if (!socket) return;
    let typingTimer;

    const onMessage = ({ message, conversation }) => {
      if (conversation.id !== conversationId) return;
      addMessage(message);
      if (String(message.sender) !== String(user?.id)) {
        setOtherTyping(false);
        markRead(conversationId);
      }
    };
    const onTyping = (payload) => {
      if (payload.conversationId !== conversationId) return;
      setOtherTyping(true);
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => setOtherTyping(false), TYPING_VISIBLE_MS);
    };

    socket.on('message:new', onMessage);
    socket.on('typing', onTyping);
    return () => {
      socket.off('message:new', onMessage);
      socket.off('typing', onTyping);
      clearTimeout(typingTimer);
    };
  }, [socket, conversationId, user?.id, addMessage, markRead]);

  // Follow new messages only if the user is already near the bottom.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [thread.messages.length, outbox.length, otherTyping]);

  const handleScroll = () => {
    const el = scrollRef.current;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  };

  const loadOlder = async () => {
    const el = scrollRef.current;
    const previousHeight = el.scrollHeight;
    setLoadingOlder(true);
    try {
      const data = await chatService.messages(conversationId, thread.messages[0].createdAt);
      stickToBottom.current = false;
      setThread((t) => ({ ...t, messages: [...data.messages, ...t.messages], hasMore: data.hasMore }));
      // Keep the message the user was looking at in place.
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - previousHeight;
      });
    } catch (error) {
      toast({ title: 'Couldn’t load older messages', description: error.message, variant: 'error' });
    } finally {
      setLoadingOlder(false);
    }
  };

  const send = async (text, tempId = `tmp-${++tempCounter}`) => {
    stickToBottom.current = true;
    setOutbox((list) => [
      ...list.filter((m) => m.tempId !== tempId),
      { tempId, text, createdAt: new Date().toISOString(), status: 'pending' },
    ]);
    try {
      addMessage(await chatService.send(conversationId, text));
      setOutbox((list) => list.filter((m) => m.tempId !== tempId));
    } catch (error) {
      setOutbox((list) => list.map((m) => (m.tempId === tempId ? { ...m, status: 'failed' } : m)));
      toast({ title: 'Message not sent', description: error.message, variant: 'error' });
    }
  };

  if (thread.error) {
    return (
      <div className="grid flex-1 place-items-center p-6">
        <EmptyState
          icon={MessageCircleOff}
          title="Conversation not found"
          description="It may have been removed, or the link is wrong."
          action={
            <Link to="/app/messages" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Back to messages
            </Link>
          }
        />
      </div>
    );
  }

  const { conversation, messages } = thread;
  const other = conversation?.other;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-line p-3 sm:px-5">
        <Link to="/app/messages" aria-label="Back to conversations" className="focus-ring grid size-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-ink lg:hidden">
          <ArrowLeft className="size-5" />
        </Link>
        {conversation ? (
          <>
            <UserAvatar user={other} className="size-11 ring-2" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate font-bold text-ink">
                {other ? (
                  <Link to={`/app/sellers/${other.id}`} className="focus-ring truncate rounded hover:text-brand-600 dark:hover:text-brand-300">
                    {other.name}
                  </Link>
                ) : (
                  'Deleted user'
                )}
                {other?.verified && <BadgeCheck className="size-4 shrink-0 fill-brand-400 text-white" />}
              </p>
              <p className="h-4 text-xs text-muted">{otherTyping ? <span className="font-semibold text-brand-600 dark:text-brand-300">typing…</span> : other?.verified ? 'Verified seller' : 'Petly member'}</p>
            </div>
            {conversation.pet && (
              <Link
                to={`/app/pets/${conversation.pet.slug ?? conversation.pet.id}`}
                className="focus-ring hidden items-center gap-2 rounded-2xl border border-line p-1.5 pr-3 transition hover:border-brand-300 hover:shadow-soft sm:flex"
              >
                <SmartImage src={conversation.pet.image} alt="" className="size-9 rounded-xl" />
                <span className="leading-tight">
                  <span className="block max-w-36 truncate text-xs font-bold text-ink">{conversation.pet.name}</span>
                  <span className="block text-[11px] font-semibold text-brand-600 dark:text-brand-300">{formatPrice(conversation.pet.price)}</span>
                </span>
              </Link>
            )}
          </>
        ) : (
          <>
            <Skeleton className="size-11" rounded="rounded-full" />
            <Skeleton className="h-4 w-32" />
          </>
        )}
      </header>

      {/* Messages */}
      {thread.loading ? (
        <ThreadSkeleton />
      ) : (
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 space-y-2 overflow-y-auto bg-canvas/60 p-4 sm:p-5">
          {thread.hasMore && (
            <div className="flex justify-center pb-2">
              <button
                type="button"
                onClick={loadOlder}
                disabled={loadingOlder}
                className="focus-ring flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-muted transition hover:text-ink"
              >
                {loadingOlder && <Loader2 className="size-3.5 animate-spin" />} Load earlier messages
              </button>
            </div>
          )}

          {messages.length === 0 && outbox.length === 0 && (
            <div className="grid h-full place-items-center text-center">
              <div>
                <UserAvatar user={other} className="mx-auto size-16" />
                <p className="mt-3 font-bold text-ink">Start the conversation</p>
                <p className="mt-1 text-sm text-muted">Ask {other?.name?.split(' ')[0] ?? 'the seller'} about health, visits or delivery.</p>
              </div>
            </div>
          )}

          {messages.map((message, index) => {
            const newDay = index === 0 || formatDayLabel(messages[index - 1].createdAt) !== formatDayLabel(message.createdAt);
            return (
              <Fragment key={message.id}>
                {newDay && (
                  <p className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {formatDayLabel(message.createdAt)}
                  </p>
                )}
                <MessageBubble message={message} mine={String(message.sender) === String(user?.id)} />
              </Fragment>
            );
          })}

          {outbox.map((item) => (
            <MessageBubble key={item.tempId} message={item} mine status={item.status} onRetry={() => send(item.text, item.tempId)} />
          ))}

          <AnimatePresence>{otherTyping && <TypingDots />}</AnimatePresence>
        </div>
      )}

      <ChatComposer
        onSend={send}
        onTyping={() => socket?.emit('typing', { conversationId })}
        disabled={thread.loading}
      />
    </div>
  );
}
