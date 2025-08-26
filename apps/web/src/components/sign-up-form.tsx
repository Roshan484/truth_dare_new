"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";
import FormSkeleton from "./ui/form-skeleton";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      try {
        toast.loading("Creating your account...", { id: "signup" });

        const result = await signUp({
          email: value.email,
          password: value.password,
          name: value.name,
        });

        if ("error" in result && result.error) {
          throw new Error(result.error.message || "Sign up failed");
        }

        toast.success("Account created successfully!", { id: "signup" });
        router.push(`${process.env.NEXT_PUBLIC_REDIRECT_URL as string}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        toast.error(errorMessage, { id: "signup" });
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(6, "Username must be at least 6 characters"),
        email: z
          .string()
          .email("Invalid email address")
          .min(1, "Enter an email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-7xl">
      <div className="flex overflow-y-hidden items-center justify-center mx-auto w-full px-2">
        <div className="w-full max-w-6xl overflow-hidden rounded-xl shadow-2xl md:grid md:grid-cols-2 lg:grid-cols-2 border border-slate-600">
          {/* Left side - Form */}
          <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-md border-none py-2 shadow-none">
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-3xl font-extrabold">
                  Create Your Account
                </CardTitle>
                <p className="text-md text-muted-foreground">
                  Enter your details to get started.
                </p>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <form.Field name="name">
                      {(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Username</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={form.state.isSubmitting}
                            placeholder="Enter your username"
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
                            placeholder="Create a secure password"
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
                            Creating Account...
                          </>
                        ) : (
                          "Sign Up"
                        )}
                      </Button>
                    )}
                  </form.Subscribe>
                </form>

                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    className="text-indigo-600 hover:text-indigo-800"
                    asChild
                  >
                    <Link href="/auth/login">
                      Already have an account? Sign In
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative hidden border-l border-slate-600 items-center justify-center p-8 md:flex lg:p-12">
            <Image
              src="/register.svg"
              alt="Abstract background for registration"
              width={600}
              height={600}
              className="h-full w-full rounded-lg object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent" />
            <div className="absolute bottom-4 left-8 border border-slate-600 p-2 rounded-md">
              <h2 className="text-2xl font-bold">Join Askova Today</h2>
              <p className="mt-2 text-base">
                Unlock a world of learning and growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
