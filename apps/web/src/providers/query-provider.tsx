"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState, type ReactNode } from "react";

const QueryProvider = ({ children }: { children: Readonly<ReactNode> }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
