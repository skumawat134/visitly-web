import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from './auth.types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: {
        accessToken: null,
        refreshToken: null,
      },
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setTokens: (tokens) =>
        set({
          tokens,
          isAuthenticated: !!tokens?.accessToken,
        }),

      logout: () =>
        set({
          user: null,
          tokens: {
            accessToken: null,
            refreshToken: null,
          },
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-session',
      storage: {
        getItem: (key) => {
          const value = sessionStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => {
          sessionStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => sessionStorage.removeItem(key),
      },
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        setUser: state.setUser,
        setTokens: state.setTokens,
        logout: state.logout,
      }),
  
    }
  )
);

