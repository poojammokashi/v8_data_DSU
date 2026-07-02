import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // { id, name, email, role, avatarUrl }
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken: refreshToken ?? get().refreshToken, isAuthenticated: true }),

      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),

      updateUser: (partial) =>
        set({ user: { ...get().user, ...partial } }),

      // Used by the axios response interceptor after a successful silent
      // token refresh — updates only the access token, leaving the user
      // and refresh token untouched.
      setAccessToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: 'voltura-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
