import { BadgeCheck, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from '@/components/layout/UserAvatar';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatShortDate } from '@/lib/format';

function ConversationRow({ conversation, active, meId }) {
  const { other, pet, lastMessage, unread } = conversation;
  const fromMe = lastMessage && String(lastMessage.sender) === String(meId);

  return (
    <Link
      to={`/app/messages/${conversation.id}`}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'focus-ring flex items-center gap-3 rounded-2xl p-3 transition-colors',
        active ? 'bg-brand-100 dark:bg-brand-400/15' : 'hover:bg-surface-2',
      )}
    >
      <UserAvatar user={other} className="size-12 ring-2" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="flex min-w-0 items-center gap-1 truncate font-bold text-ink">
            <span className="truncate">{other?.name ?? 'Deleted user'}</span>
            {other?.verified && <BadgeCheck className="size-4 shrink-0 fill-brand-400 text-white" />}
          </p>
          {lastMessage && (
            <span className={cn('ml-auto shrink-0 text-[11px]', unread ? 'font-bold text-brand-600 dark:text-brand-300' : 'text-muted')}>
              {formatShortDate(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <p className={cn('truncate text-sm', unread ? 'font-semibold text-ink' : 'text-muted')}>
            {lastMessage ? `${fromMe ? 'You: ' : ''}${lastMessage.text}` : pet ? `About ${pet.name}` : 'Say hello'}
          </p>
          {unread > 0 && (
            <span className="on-brand ml-auto grid min-w-5 shrink-0 place-items-center rounded-full bg-brand-400 px-1.5 text-[11px] font-bold text-ink">
              {unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="size-12" rounded="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ConversationList({ conversations, activeId, meId }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = q
    ? conversations.filter((c) => [c.other?.name, c.pet?.name].some((field) => field?.toLowerCase().includes(q)))
    : conversations;

  return (
    <div className="flex h-full flex-col">
      <label className="m-3 flex h-11 items-center gap-2 rounded-2xl bg-surface-2 px-4 text-sm transition focus-within:ring-4 focus-within:ring-brand-300/30">
        <Search className="size-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
          className="flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
        />
      </label>
      <nav aria-label="Conversations" className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        {visible.map((conversation) => (
          <ConversationRow key={conversation.id} conversation={conversation} active={conversation.id === activeId} meId={meId} />
        ))}
        {visible.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">No chats match “{query}”</p>}
      </nav>
    </div>
  );
}
