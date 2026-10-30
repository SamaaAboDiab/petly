import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { chatService, toConversation } from '@/services/chatService';
import { useAuth } from './AuthContext';
import { useSocket, useSocketEvent } from './SocketContext';

const ChatContext = createContext(null);

/** Puts the conversation first, replacing any older copy. */
const upsertFirst = (list, conversation) => [conversation, ...list.filter((c) => c.id !== conversation.id)];

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConversations([]);
    setLoaded(false);
    if (!userId) return;

    let cancelled = false;
    chatService
      .list()
      .then((list) => !cancelled && setConversations(list))
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useSocketEvent(
    'message:new',
    useCallback(({ conversation }) => setConversations((list) => upsertFirst(list, toConversation(conversation))), []),
  );

  useSocketEvent(
    'conversation:read',
    useCallback(
      ({ conversationId }) =>
        setConversations((list) => list.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c))),
      [],
    ),
  );

  const startChat = useCallback(async ({ sellerId, petId }) => {
    const conversation = await chatService.start({ sellerId, petId });
    setConversations((list) =>
      list.some((c) => c.id === conversation.id)
        ? list.map((c) => (c.id === conversation.id ? { ...c, pet: conversation.pet } : c))
        : [conversation, ...list],
    );
    return conversation.id;
  }, []);

  const markRead = useCallback((conversationId) => {
    setConversations((list) => list.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)));
    chatService.markRead(conversationId).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      socket,
      conversations,
      loaded,
      unreadTotal: conversations.reduce((sum, c) => sum + (c.unread || 0), 0),
      startChat,
      markRead,
    }),
    [socket, conversations, loaded, startChat, markRead],
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}

export function useChat() {
  const context = use(ChatContext);
  if (!context) throw new Error('useChat must be used inside <ChatProvider>');
  return context;
}
