"use client";

import { Toaster } from "sonner";
import QueryProvider from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import AuthProvider from "./auth-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster richColors />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
