import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  initApiClient,
  initQueryClient,
} from "@visitly/api-client";

const queryClient = initQueryClient();

initApiClient({
  baseURL: "/api",
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