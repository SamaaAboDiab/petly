import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { UNAUTHORIZED_EVENT } from '@/services/api';
import { authService } from '@/services/authService';
import { authStorage } from '@/services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // The user is cached so the app renders instantly on refresh; the token is
  // what actually authorizes requests (read by services/api.js).
  const [user, setUser] = useState(() => (authStorage.getToken() ? authStorage.getUser() : null));

  /** `remember` = "Remember me": keep the session after the browser closes. */
  const startSession = useCallback((session, remember = true) => {
    authStorage.save(session, remember);
    setUser(session.user);
    return session.user;
  }, []);

  const endSession = useCallback(() => {
    authStorage.clear();
    setUser(null);
  }, []);

  const login = useCallback(
    async (credentials, { remember = true } = {}) => startSession(await authService.login(credentials), remember),
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

  /** Replace the cached user after a profile/settings change. */
  const updateUser = useCallback((nextUser) => {
    authStorage.saveUser(nextUser);
    setUser(nextUser);
  }, []);

  // Refresh the cached user once per load (role/verified may have changed).
  useEffect(() => {
    if (!authStorage.getToken()) return;
    authService
      .me()
      .then(updateUser)
      .catch(() => {});
  }, [updateUser]);

  // Any request answered with 401 means the token is no longer valid.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, endSession);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, endSession);
  }, [endSession]);

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
