"use client";

import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof Error) {
            const message = error.message.toLowerCase();
            if (
              message.includes("not connected") ||
              message.includes("timeout") ||
              message.includes("query timeout") ||
              message.includes("no relays connected")
            ) {
              return false;
            }
          }

          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(750 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    browserQueryClient ??= makeQueryClient();

    return browserQueryClient;
  }
}
