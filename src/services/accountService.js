import { request } from './api';
import { toUser } from './authService';

export const accountService = {
  /** `values`: { name, location }. Pass `avatar` (File) to replace the photo, or `removeAvatar`. */
  updateProfile: ({ name, location, avatar, removeAvatar }) => {
    const form = new FormData();
    form.append('name', name);
    form.append('location', location);
    if (avatar) form.append('avatar', avatar);
    else if (removeAvatar) form.append('removeAvatar', 'true');
    return request('/account/profile', { method: 'PATCH', body: form }).then((data) => toUser(data.user));
  },

  changePassword: ({ currentPassword, newPassword }) =>
    request('/account/password', { method: 'PATCH', body: { currentPassword, newPassword } }),

  /** `notifications`: partial { orders, activity, account } booleans. */
  updatePreferences: (notifications) =>
    request('/account/preferences', { method: 'PATCH', body: { notifications } }).then((data) => toUser(data.user)),
};

export const supportService = {
  create: ({ category, subject, message }) =>
    request('/support', { method: 'POST', body: { category, subject, message } }).then((data) => data.ticket),
  mine: () => request('/support/mine').then((data) => data.tickets),
};
