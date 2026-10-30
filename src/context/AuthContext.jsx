import { createContext, use, useCallback, useEffect, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { storage } from '@/lib/storage';
import { TOKEN_KEY, UNAUTHORIZED_EVENT } from '@/services/api';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // The user is cached so the app renders instantly on refresh; the token is
  // what actually authorizes requests (read by services/api.js).
  const [user, setUser] = usePersistentState('session', null);

  const startSession = useCallback(
    ({ user: sessionUser, token }) => {
      storage.set(TOKEN_KEY, token);
      setUser(sessionUser);
      return sessionUser;
    },
    [setUser],
  );

  const endSession = useCallback(() => {
    storage.remove(TOKEN_KEY);
    setUser(null);
  }, [setUser]);

  const login = useCallback(
    async (credentials) => startSession(await authService.login(credentials)),
    [startSession],
  );

  const register = useCallback(
    async (payload) => startSession(await authService.register(payload)),
    [startSession],
  );

  const resetPassword = useCallback(
    async (payload) => startSession(await authService.resetPassword(payload)),
    [startSession],
  );

  const logout = useCallback(() => {
    authService.logout();
    endSession();
  }, [endSession]);

  // Refresh the cached user once per load (role/verified may have changed),
  // and drop sessions whose token was removed or expired.
  useEffect(() => {
    if (!storage.get(TOKEN_KEY, null)) {
      setUser(null);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Any request answered with 401 means the token is no longer valid.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, endSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, endSession);
  }, [endSession]);

  /** Replace the cached user after a profile/settings change. */
  const updateUser = useCallback((nextUser) => setUser(nextUser), [setUser]);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, resetPassword, logout, updateUser }),
    [user, login, register, resetPassword, logout, updateUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
