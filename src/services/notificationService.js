import { request } from './api';

export const notificationService = {
  /** `{ notifications, hasMore, unread }` — newest first, 20 per page. */
  list: (before) => request('/notifications', { params: { before } }),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
};
