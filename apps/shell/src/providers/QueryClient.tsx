import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  initApiClient,
  initQueryClient,
} from "@visitly/api-client";
const queryClient = initQueryClient();
const API_URL = 'https://3vza0x99ll.execute-api.us-west-2.amazonaws.com/development/v1/'
initApiClient({
  baseURL: API_URL,
  getToken: () => localStorage.getItem("token") ?? undefined,
  onUnauthorized: () => {
    console.log("Unauthorized – redirect to login");
  },
});

export function QueryClient({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}