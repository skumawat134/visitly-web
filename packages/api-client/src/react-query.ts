import { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | null = null;

export function initQueryClient(): QueryClient {
  if (queryClient) {
    return queryClient;
  }

  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  });

  return queryClient;
}

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    throw new Error(
      "QueryClient not initialized. Call initQueryClient() in the shell first."
    );
  }
  return queryClient;
}
