import { sessionStore, storage } from '@/lib/storage';

/**
 * Where the signed-in session lives. "Remember me" keeps it in localStorage
 * (survives closing the browser); otherwise sessionStorage (signed out when
 * the browser closes). Token and cached user always live in the same place.
 */
const TOKEN_KEY = 'token';
const USER_KEY = 'session';

const activeStore = () => (sessionStore.get(TOKEN_KEY, null) ? sessionStore : storage);

export const authStorage = {
  getToken: () => sessionStore.get(TOKEN_KEY, null) ?? storage.get(TOKEN_KEY, null),

  getUser: () => activeStore().get(USER_KEY, null),

  save({ token, user }, remember = true) {
    this.clear();
    const target = remember ? storage : sessionStore;
    target.set(TOKEN_KEY, token);
    target.set(USER_KEY, user);
  },

  /** Updates the cached user wherever the current session is stored. */
  saveUser(user) {
    activeStore().set(USER_KEY, user);
  },

  clear() {
    [storage, sessionStore].forEach((store) => {
      store.remove(TOKEN_KEY);
      store.remove(USER_KEY);
    });
  },
};
