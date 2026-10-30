import { assetUrl, request } from './api';

/** Credentials of the seeded demo account (see server/src/seed/data.js). */
export const DEMO_USER = { email: 'demo@petly.com', password: 'petly123' };

/** API user -> session user (absolute avatar URL). */
export const toUser = (user) => user && { ...user, avatar: assetUrl(user.avatar) };

const post = (path, body) => request(path, { method: 'POST', body });
const toSession = ({ user, token }) => ({ user: toUser(user), token });

export const authService = {
  /** Resolves to `{ user, token }`. */
  login: (credentials) => post('/auth/login', credentials).then(toSession),
  register: (payload) => post('/auth/register', payload).then(toSession),
  me: () => request('/auth/me').then((data) => toUser(data.user)),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  /** Resolves to `{ user, token }` — a successful reset signs the user in. */
  resetPassword: ({ token, password }) => post('/auth/reset-password', { token, password }).then(toSession),
  // The token is dropped client-side either way, so a failed call is harmless.
  logout: () => post('/auth/logout').catch(() => {}),
};
