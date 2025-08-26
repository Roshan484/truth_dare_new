"use client";
import { authClient } from "@/lib/auth-client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

export default function SignInForm() {
  const router = useRouter();
  const { signIn, isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const googleSignInMutation = useMutation({
    mutationFn: async () => {
      return authClient.signIn.social({
        provider: "google",
        callbackURL: `${process.env.NEXT_PUBLIC_REDIRECT_URL as string}`,
      });
    },
    onMutate: () => {
      toast.loading("Signing in with Google...", { id: "google-login" });
    },
    onSuccess: () => {
      toast.success("Google sign in successful!", { id: "google-login" });
      router.push("/");
    },
    onError: (error: Error) => {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google", { id: "google-login" });
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        toast.loading("Signing in...", { id: "email-login" });

        const result = await signIn({
          email: value.email,
          password: value.password,
        });

        if ("error" in result && result.error) {
          throw new Error(result.error.message || "Sign in failed");
        }

        toast.success("Sign in successful!", { id: "email-login" });
        router.push("/");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        toast.error(errorMessage, { id: "email-login" });
      }
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto mt-10">
      <div className="flex overflow-y-hidden items-center justify-center mx-auto w-full px-2">
        <div className="w-full max-w-6xl mx-auto overflow-hidden rounded-xl shadow-2xl md:grid md:grid-cols-2 lg:grid-cols-2 border border-slate-500">
          <div className="relative hidden items-center justify-center p-8 md:flex lg:p-12 border-r border-slate-500">
            <Image
              src="/login-illu.svg"
              alt="Abstract background"
              width={600}
              height={600}
              className="h-full w-full rounded-lg object-cover"
              priority
            />
            <div className="absolute inset-0" />
            <div className="absolute bottom-8 left-8">
              <h2 className="text-3xl font-bold">Welcome to Askova</h2>
              <p className="mt-2 text-lg">
                Your journey to knowledge starts here.
              </p>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
            <Card className="w-full max-w-md border-none shadow-none">
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-3xl font-extrabold">
                  Login to Askova
                </CardTitle>
                <p className="text-md text-foreground">
                  Enter your credentials to access your account.
                </p>
              </CardHeader>
              <CardContent>
                {/* Email/Password Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  {/* Email Field */}
                  <div>
                    <form.Field name="email">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Email</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={form.state.isSubmitting}
                            placeholder="Enter your email"
                          />
                          {field.state.meta.errors.map((error) => (
                            <p
                              key={error?.message}
                              className="text-red-500 text-sm"
                            >
                              {error?.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </form.Field>
                  </div>

                  {/* Password Field */}
                  <div>
                    <form.Field name="password">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Password</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={form.state.isSubmitting}
                            placeholder="Enter your password"
                          />
                          {field.state.meta.errors.map((error) => (
                            <p
                              key={error?.message}
                              className="text-red-500 text-sm"
                            >
                              {error?.message}
                            </p>
                          ))}
                        </div>
                      )}
                    </form.Field>
                  </div>

                  {/* Submit Button */}
                  <form.Subscribe>
                    {(state) => (
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={!state.canSubmit || state.isSubmitting}
                      >
                        {state.isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Signing In...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    )}
                  </form.Subscribe>
                </form>

                {/* Divider */}
                <hr className="mb-2 mt-4 border-slate-600" />
                <div className="text-center text-xs">Or Sign in with</div>
                <hr className="my-2 border-slate-600" />

                {/* Google Sign In */}
                <div className="mt-4 flex flex-col w-full">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      googleSignInMutation.mutate();
                    }}
                    disabled={googleSignInMutation.isPending}
                  >
                    {googleSignInMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="h-5 w-5 mr-2"
                    >
                      <path
                        fill="#4285F4"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.6 30.47 0 24 0 14.64 0 6.56 5.82 2.56 14.1l7.98 6.2C12.13 13.24 17.62 9.5 24 9.5z"
                      />
                      <path
                        fill="#34A853"
                        d="M46.5 24.5c0-1.64-.15-3.2-.42-4.71H24v9.02h12.7c-.55 2.96-2.17 5.48-4.62 7.18l7.23 5.63C43.76 37.39 46.5 31.38 46.5 24.5z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.54 28.3c-.5-1.48-.79-3.05-.79-4.8 0-1.66.29-3.32.8-4.8l-7.99-6.2C.9 15.82 0 19.76 0 24c0 4.24.9 8.18 2.56 11.5l7.98-6.2z"
                      />
                      <path
                        fill="#EA4335"
                        d="M24 48c6.48 0 11.9-2.13 15.87-5.81l-7.23-5.63c-2.02 1.36-4.6 2.17-8.64 2.17-6.38 0-11.87-3.74-14.46-9.1l-7.98 6.2C6.56 42.18 14.64 48 24 48z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                </div>

                {/* Sign Up Link */}
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    className="text-indigo-600 hover:text-indigo-800"
                    asChild
                  >
                    <Link href="/auth/register">Need an account? Sign Up</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
