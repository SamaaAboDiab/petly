import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { usePolling } from '@/hooks/usePolling';
import { notificationService } from '@/services/notificationService';
import { useAuth } from './AuthContext';
import { useSocket, useSocketEvent } from './SocketContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const toast = useToast();
  const socket = useSocket();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems([]);
    setUnread(0);
    setLoaded(false);
    if (!userId) return;

    let cancelled = false;
    notificationService
      .list()
      .then((data) => {
        if (cancelled) return;
        setItems(data.notifications);
        setUnread(data.unread);
        setHasMore(data.hasMore);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useSocketEvent(
    'notification:new',
    useCallback(
      (notification) => {
        setItems((list) => [notification, ...list]);
        setUnread((count) => count + 1);
        toast({ title: notification.title, description: notification.body, variant: 'info' });
      },
      [toast],
    ),
  );

  // Without a live socket, check for new notifications periodically.
  usePolling(
    () =>
      notificationService
        .list()
        .then((data) => {
          const known = new Set(items.map((n) => n.id));
          const fresh = data.notifications.filter((n) => !known.has(n.id));
          setUnread(data.unread);
          if (!fresh.length) return;
          setItems((list) => [...fresh.filter((n) => !list.some((item) => item.id === n.id)), ...list]);
          toast({ title: fresh[0].title, description: fresh[0].body, variant: 'info' });
        })
        .catch(() => {}),
    20_000,
    Boolean(userId) && loaded && !socket,
  );

  const loadMore = useCallback(async () => {
    const data = await notificationService.list(items.at(-1)?.createdAt);
    setItems((list) => [...list, ...data.notifications]);
    setHasMore(data.hasMore);
  }, [items]);

  const markRead = useCallback(
    (id) => {
      const target = items.find((n) => n.id === id);
      if (!target || target.read) return;
      setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((count) => Math.max(0, count - 1));
      notificationService.markRead(id).catch(() => {});
    },
    [items],
  );

  const markAllRead = useCallback(() => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    setUnread(0);
    notificationService.markAllRead().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ items, unread, hasMore, loaded, loadMore, markRead, markAllRead }),
    [items, unread, hasMore, loaded, loadMore, markRead, markAllRead],
  );

  return <NotificationContext value={value}>{children}</NotificationContext>;
}

export function useNotifications() {
  const context = use(NotificationContext);
  if (!context) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return context;
}
