"use client";

import { authClient } from "@/lib/auth-client";
import {
  useQuery,
  useQueryClient,
  QueryClient,
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";
import React, { createContext, useContext, type ReactNode } from "react";
import { toast } from "sonner";

type BetterAuthSessionData = Awaited<ReturnType<typeof authClient.getSession>>;
type BetterAuthSignInData = Awaited<ReturnType<typeof authClient.signIn.email>>;
type BetterAuthSignUpData = Awaited<ReturnType<typeof authClient.signUp.email>>;

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface AuthData {
  user: User;
  session: Session;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

interface AuthHeaders {
  Authorization: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;

  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  token: string | null;

  signIn: (credentials: SignInCredentials) => Promise<BetterAuthSignInData>;
  signOut: () => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<BetterAuthSignUpData>;

  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<AuthData | null, Error>>;
  getAuthHeaders: () => AuthHeaders | Record<string, never>;
  isSessionValid: () => boolean;
  invalidateAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AUTH_QUERY_KEY = ["auth", "session"];

export const AuthProvider = ({
  children,
}: {
  children: Readonly<ReactNode>;
}) => {
  const queryClient = useQueryClient();

  const isSessionValid = (sessionData: Session | null): boolean => {
    if (!sessionData) return false;
    return new Date() < new Date(sessionData.expiresAt);
  };

  const {
    data: authData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AuthData | null, Error>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<AuthData | null> => {
      try {
        const sessionData: BetterAuthSessionData =
          await authClient.getSession();

        if ("error" in sessionData && sessionData.error) {
          throw new Error(sessionData.error.message || "Failed to get session");
        }

        return sessionData.data || null;
      } catch (err) {
        console.error("Failed to get session:", err);
        throw err instanceof Error ? err : new Error("Failed to get session");
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("auth")) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const user = authData?.user || null;
  const session = authData?.session || null;
  const token = session?.token || null;

  const isAuthenticated = !!(user && session && isSessionValid(session));

  const checkSessionValid = (): boolean => {
    return isSessionValid(session);
  };

  const getAuthHeaders = (): AuthHeaders | Record<string, never> => {
    if (token && checkSessionValid()) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  const invalidateAuth = () => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  };

  const signIn = async (
    credentials: SignInCredentials
  ): Promise<BetterAuthSignInData> => {
    const toastId = toast.loading("Signing in...");

    try {
      const result: BetterAuthSignInData = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      if ("error" in result && result.error) {
        throw new Error(result.error.message || "Sign in failed");
      }

      invalidateAuth();

      toast.success("Welcome back!", {
        id: toastId,
        description: `Successfully signed in as ${credentials.email}`,
      });

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign in failed");

      toast.error("Sign in failed", {
        id: toastId,
        description: error.message,
      });

      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    const toastId = toast.loading("Signing out...");

    try {
      queryClient.setQueryData<AuthData | null>(AUTH_QUERY_KEY, null);

      await authClient.signOut();

      queryClient.clear();

      toast.success("Signed out successfully", {
        id: toastId,
        description: "You have been signed out of your account",
      });
    } catch (err) {
      console.error("Sign out error:", err);

      refetch();
      const error = err instanceof Error ? err : new Error("Sign out failed");

      toast.error("Sign out failed", {
        id: toastId,
        description: error.message,
      });

      throw error;
    }
  };

  const signUp = async (
    credentials: SignUpCredentials
  ): Promise<BetterAuthSignUpData> => {
    const toastId = toast.loading("Creating your account...");

    try {
      const result: BetterAuthSignUpData = await authClient.signUp.email({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      });

      if ("error" in result && result.error) {
        throw new Error(result.error.message || "Sign up failed");
      }

      invalidateAuth();

      toast.success("Account created successfully!", {
        id: toastId,
        description: `Welcome ${credentials.name}! Please check your email to verify your account.`,
      });

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign up failed");

      toast.error("Account creation failed", {
        id: toastId,
        description: error.message,
      });

      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    isAuthenticated,
    isLoading,
    isError,
    error,
    token,
    signIn,
    signOut,
    signUp,
    refetch,
    getAuthHeaders,
    isSessionValid: checkSessionValid,
    invalidateAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const useAuthQuery = () => {
  return useQuery<AuthData | null, Error>({
    queryKey: AUTH_QUERY_KEY,
    enabled: false,
  });
};

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div>Please sign in to access this page.</div>;
    }

    return <Component {...props} />;
  };
};

export const prefetchAuthData = (queryClient: QueryClient) => {
  return queryClient.prefetchQuery<AuthData | null, Error>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<AuthData | null> => {
      const sessionData: BetterAuthSessionData = await authClient.getSession();

      if ("error" in sessionData && sessionData.error) {
        throw new Error(sessionData.error.message || "Failed to get session");
      }

      return sessionData.data || null;
    },
  });
};

export default AuthProvider;
