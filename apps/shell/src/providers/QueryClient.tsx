import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  initApiClient,
  initQueryClient,
} from "@visitly/api-client";
import {type AuthState, useAuthStore, useToastStore } from "@visitly/app-store";
import { GlobalLoader } from "@/components/GlobalLoader";
import FullScreenLoader from "@/components/FullScreenLoader";

interface ZustandState<T> {
  state: T
}
const queryClient = initQueryClient();
const API_URL = 'https://3vza0x99ll.execute-api.us-west-2.amazonaws.com/development/v1/'
initApiClient({
  baseURL: API_URL,
  refreshTokenUrl: API_URL + "users/token",
  getToken: () => {
    const session = sessionStorage.getItem("auth-session");
    if (!session) return undefined;
    try {
      const parsed = JSON.parse(session) as ZustandState<AuthState>;
      return parsed.state.tokens?.accessToken ?? undefined;
    } catch {
      return undefined;
    }
  },
  onUnauthorized: () => {
    useAuthStore.getState().setUnauthenticated();
    localStorage.clear();
    sessionStorage.clear();
  },
  onError: (message, status) => {
    const showToast = useToastStore.getState().showToast;
    showToast({ message: message, type: "error" });
  },
  getRefreshToken() {
    return localStorage.getItem("C") || '' // refers to refresh token
  },
  onTokenRefresh: ({ accessToken }) => {
    const { tokens, setTokens } = useAuthStore.getState(); // should trigger entitilement,userinfo
    setTokens({
      ...tokens,
      accessToken,
    });
    sessionStorage.setItem('accessToken', `Bearer ${accessToken}`);
  }
});

export function QueryClient({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoader />
      <FullScreenLoader />
      {children}
    </QueryClientProvider>
  );
}