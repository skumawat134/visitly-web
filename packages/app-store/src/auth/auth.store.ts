import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StateCreator } from 'zustand'

import type { AuthState, AuthStatus, User, AuthTokens, PersistedAuthState } from './auth.types'


const authSlice: StateCreator<
  AuthState,
  [],
  [],
  AuthState
> = (set, get) => ({
  // ── State ─────────────────────────────────────
  status: 'checking',
  user: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
  isAuthenticated: false,
  callbackUrl: null,

  // ── Actions ───────────────────────────────────
  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      // Optional: reset status if user becomes null
      ...(user === null && { status: 'unauthenticated' }),
    })
  },

  setTokens: (tokens: AuthTokens) =>
    set({
      tokens: {
        accessToken: tokens.accessToken ?? null,
        refreshToken: tokens.refreshToken ?? null,
      },
    }),

  startAuth: (callbackUrl?: string) =>
    set({
      status: 'checking',
      callbackUrl: callbackUrl ?? null,
    }),

  setChecking: () => set({ status: 'checking' }),

  setAuthenticated: ({ user, tokens }: { user: User; tokens: AuthTokens }) =>
    set({
      status: 'authenticated',
      user,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? null,
      },
      isAuthenticated: true,
      callbackUrl: null,
    }),

  setUnauthenticated: () =>
    set({
      status: 'unauthenticated',
      user: null,
      tokens: { accessToken: null, refreshToken: null },
      isAuthenticated: false,
      callbackUrl: null,
    }),

  failAuth: () =>
    set({
      status: 'unauthenticated', // or 'error' if you want to distinguish
      user: null,
      tokens: { accessToken: null, refreshToken: null },
      isAuthenticated: false,
      callbackUrl: null,
    }),

  logout: () =>
    set({
      status: 'unauthenticated',
      user: null,
      tokens: { accessToken: null, refreshToken: null },
      isAuthenticated: false,
      callbackUrl: null,
    }),

  clearCallback: () => set({ callbackUrl: null }),

  // Placeholder — implement real permission logic later
  can: (_capability: string) => get().isAuthenticated,

  // Very naive path-based access — replace with real logic
  canAccess: (cb : ()=>boolean) => cb() || get().isAuthenticated,
})

// ────────────────────────────────────────────────
//              Persisted version
// ────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    authSlice,
    {
      name: 'auth-session',              // key in sessionStorage
      storage: createJSONStorage(() => sessionStorage),

      // What actually gets persisted
      partialize: (state): PersistedAuthState => ({
        status: state.status,
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        callbackUrl: state.callbackUrl,
      }),


      // Optional but recommended in most auth cases
      onRehydrateStorage: () => {
        // You can return a function that runs after rehydration
        return (state, error) => {
          if (error) {
            console.error('Auth store rehydration failed:', error)
            // You could call setUnauthenticated() here
          }
          if (state) {
            // Optional: validate tokens age, etc.
            console.log('state=================',state,sessionStorage.getItem('userinfo') && sessionStorage.getItem('accessToken'))
            if(sessionStorage.getItem('userinfo') && sessionStorage.getItem('accessToken')){
            state.isAuthenticated = true;
            state.tokens.accessToken =  sessionStorage.getItem('accessToken')?.split(' ')[1] as string;
            state.tokens.refreshToken = localStorage.getItem('refreshToken');
            state.status = "authenticated"
            state.user  = JSON.parse(sessionStorage.getItem('userinfo') || '') as unknown as User
          }
        }
        }
      },
    }
  )
)