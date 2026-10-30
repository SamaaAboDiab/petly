import { MessageCircle, MessagesSquare } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ChatThread from '@/components/chat/ChatThread';
import ConversationList, { ConversationListSkeleton } from '@/components/chat/ConversationList';
import PageTransition from '@/components/layout/PageTransition';
import { buttonStyles } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/cn';

/**
 * Two panes on desktop (list + thread). On mobile only one shows at a time:
 * the list at /app/messages, the thread at /app/messages/:conversationId.
 */
export default function MessagesPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { conversations, loaded } = useChat();

  if (loaded && conversations.length === 0 && !conversationId) {
    return (
      <PageTransition>
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Messages</h1>
        <EmptyState
          icon={MessagesSquare}
          title="No messages yet"
          description="Open any pet and tap “Contact Seller” to start a conversation."
          action={
            <Link to="/app/categories" className={buttonStyles()}>
              Browse pets
            </Link>
          }
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <h1 className={cn('mb-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl', conversationId && 'hidden lg:block')}>
        Messages
      </h1>
      <div className="grid h-[calc(100dvh-13rem)] min-h-[28rem] overflow-hidden rounded-3xl border border-line bg-surface shadow-soft lg:h-[calc(100dvh-12rem)] lg:grid-cols-[340px_1fr]">
        <aside className={cn('min-h-0 border-line lg:border-r', conversationId && 'hidden lg:block')}>
          {loaded ? (
            <ConversationList conversations={conversations} activeId={conversationId} meId={user?.id} />
          ) : (
            <ConversationListSkeleton />
          )}
        </aside>

        <section className={cn('min-h-0', !conversationId && 'hidden lg:block')}>
          {conversationId ? (
            <ChatThread key={conversationId} conversationId={conversationId} />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center">
              <div>
                <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
                  <MessageCircle className="size-8" />
                </span>
                <p className="mt-4 font-bold text-ink">Select a conversation</p>
                <p className="mt-1 text-sm text-muted">Your chats with buyers and sellers appear on the left.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
