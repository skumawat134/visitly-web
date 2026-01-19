import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  initApiClient,
  initQueryClient,
} from "@visitly/api-client";
import { toast } from "react-toastify";
import { AuthState } from "@visitly/app-store";

interface ZustandState <T>{
    state : T
}
const queryClient = initQueryClient();
const API_URL = 'https://3vza0x99ll.execute-api.us-west-2.amazonaws.com/development/v1/'
initApiClient({
  baseURL: API_URL,
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
    // sessionStorage.removeItem("auth-session");
    // window.location.href = "/visitly/login";
  },
  onError: (message, status) => {
    // This connects your shared package to the UI toast
    toast.error(
      <div dangerouslySetInnerHTML={{ __html: message }} />,
      {
        position: "top-center",
        autoClose: status === 0 ? false : 5000, // Persistent for network errors
        theme: "colored",
      }
    );
  }
});

export function QueryClient({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}