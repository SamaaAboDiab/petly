const PREFIX = 'petly:';

/** Safe Web Storage wrapper — never throws (private mode, quota, bad JSON). */
const createStorage = (getBackend) => ({
  get(key, fallback) {
    try {
      const raw = getBackend().getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      getBackend().setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(key) {
    try {
      getBackend().removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  },
});

/** Survives browser restarts. */
export const storage = createStorage(() => window.localStorage);

/** Cleared when the browser (tab session) closes. */
export const sessionStore = createStorage(() => window.sessionStorage);
