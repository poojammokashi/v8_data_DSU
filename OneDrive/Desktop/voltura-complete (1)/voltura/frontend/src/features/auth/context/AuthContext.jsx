import { createContext, useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@store/authStore';

export const AuthContext = createContext(null);

/**
 * Wraps the Zustand auth store with the actual API calls (login, logout,
 * refresh, change password) so every consumer gets a single `useAuth()`
 * hook instead of having to import the store and authApi separately.
 *
 * Also handles one-time session restoration on app load: if a persisted
 * token exists from a previous session, it's validated against /auth/me
 * before the app treats the user as authenticated, so a stale/expired
 * token doesn't silently grant access to protected routes.
 */
export function AuthProvider({ children }) {
  const { user, accessToken, isAuthenticated, login: storeLogin, logout: storeLogout, updateUser } =
    useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!accessToken) {
        setIsInitializing(false);
        return;
      }
      try {
        const { data: freshUser } = await authApi.getMe();
        if (!cancelled) updateUser(freshUser);
      } catch {
        // Token invalid/expired and refresh (handled in the axios
        // interceptor) didn't recover it — clear the stale session.
        if (!cancelled) storeLogout();
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await authApi.login({ email, password });
      storeLogin({
        user: data.user,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      return data.user;
    },
    [storeLogin]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      storeLogout();
    }
  }, [storeLogout]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await authApi.changePassword({ currentPassword, newPassword });
  }, []);

  const forgotPassword = useCallback(async (email) => {
    await authApi.forgotPassword(email);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isInitializing,
    login,
    logout,
    changePassword,
    forgotPassword,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
