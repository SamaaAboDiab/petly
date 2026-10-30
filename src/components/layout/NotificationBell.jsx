import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Bell, BellOff, CheckCheck, Heart, Loader2, ShoppingBag, Sparkles, Tag, UserPlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@/components/ui/IconButton';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/cn';
import { formatTimeAgo } from '@/lib/format';

const TYPE_STYLE = {
  order: { icon: ShoppingBag, className: 'bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300' },
  sale: { icon: Tag, className: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  favorite: { icon: Heart, className: 'bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300' },
  follow: { icon: UserPlus, className: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
  verified: { icon: BadgeCheck, className: 'bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300' },
  system: { icon: Sparkles, className: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
};

function NotificationItem({ notification, onOpen }) {
  const { icon: Icon, className } = TYPE_STYLE[notification.type] ?? TYPE_STYLE.system;
  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={cn(
        'focus-ring flex w-full gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-surface-2',
        !notification.read && 'bg-brand-50/70 dark:bg-brand-400/5',
      )}
    >
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', className)}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-sm leading-snug text-ink', !notification.read && 'font-bold')}>{notification.title}</span>
        {notification.body && <span className="mt-0.5 block text-xs text-muted">{notification.body}</span>}
        <span className="mt-1 block text-[11px] text-muted">{formatTimeAgo(notification.createdAt)}</span>
      </span>
      {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" />}
    </button>
  );
}

export default function NotificationBell() {
  const { items, unread, hasMore, loaded, loadMore, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const rootRef = useRef(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    const onKeyDown = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openNotification = (notification) => {
    markRead(notification.id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <IconButton icon={Bell} label="Notifications" badge={unread} onClick={() => setOpen((v) => !v)} aria-expanded={open} />

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-4 top-20 z-40 origin-top-right overflow-hidden rounded-3xl border border-line bg-surface shadow-lift sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-bold text-ink">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="focus-ring flex items-center gap-1 rounded-lg text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
                >
                  <CheckCheck className="size-4" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!loaded && <p className="py-10 text-center text-sm text-muted">Loading…</p>}
              {loaded && items.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <BellOff className="size-8 text-muted" />
                  <p className="text-sm font-semibold text-ink">You’re all caught up</p>
                  <p className="text-xs text-muted">Orders, saves and follows will show up here.</p>
                </div>
              )}
              {items.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} onOpen={openNotification} />
              ))}
              {hasMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="focus-ring mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-muted hover:bg-surface-2 hover:text-ink"
                >
                  {loadingMore && <Loader2 className="size-3.5 animate-spin" />} Load more
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
