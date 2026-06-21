"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { getHomePath, loginWithEmail } from "@/lib/supabase/auth";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

function getLoginError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unable to sign in. Please try again.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }

  if (message.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }

  return error.message;
}

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      setIsSubmitting(true);
      const role = await loginWithEmail(values);
      router.replace(getHomePath(role));
    } catch (error: unknown) {
      toast({
        title: "Login failed",
        description: getLoginError(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="pt-1">
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-xs text-danger">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/reset-password"
                className="text-xs font-medium text-primary hover:text-primary-dark"
                aria-label="Go to password reset"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-10"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {form.formState.errors.password ? (
              <p className="text-xs text-danger">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="h-11 w-full gap-2"
            aria-label="Sign in to KOLLAB"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in" : "Sign in"}
            <LogIn className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
