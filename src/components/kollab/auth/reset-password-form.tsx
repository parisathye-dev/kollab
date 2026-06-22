"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, KeyRound, MailCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  preparePasswordRecoverySession,
  sendPasswordResetEmail,
  updatePassword,
} from "@/lib/supabase/auth";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
  type UpdatePasswordInput,
  updatePasswordSchema,
} from "@/lib/validation/auth";

type ResetMode = "loading" | "request" | "update" | "sent" | "updated";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to send reset instructions.";
}

export function ResetPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [mode, setMode] = useState<ResetMode>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const requestForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const updateForm = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    async function loadRecoverySession() {
      try {
        const hasRecoverySession = await preparePasswordRecoverySession(
          window.location.href,
        );

        if (hasRecoverySession) {
          const nextUrl = new URL(window.location.href);
          nextUrl.search = "?mode=update";
          nextUrl.hash = "";
          window.history.replaceState(null, "", nextUrl.toString());
          setMode("update");
          return;
        }

        setMode("request");
      } catch (error: unknown) {
        toast({
          title: "Reset link unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        setMode("request");
      }
    }

    void loadRecoverySession();
  }, []);

  async function onSubmit(values: ResetPasswordInput) {
    try {
      setIsSubmitting(true);
      await sendPasswordResetEmail(values, window.location.origin);
      setSentTo(values.email);
      setMode("sent");
    } catch (error: unknown) {
      toast({
        title: "Reset email failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onUpdatePassword(values: UpdatePasswordInput) {
    try {
      setIsSubmitting(true);
      await updatePassword(values);
      setMode("updated");
    } catch (error: unknown) {
      toast({
        title: "Password update failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mode === "loading") {
    return (
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="space-y-4 pt-1">
          <div className="h-11 animate-pulse rounded-xl bg-muted" />
          <div className="h-11 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (mode === "updated") {
    return (
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="space-y-4 pt-1">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Password updated</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              You can now sign in with your new KOLLAB password.
            </p>
          </div>
          <Button asChild className="h-11 w-full">
            <Link href="/login" aria-label="Go to login after password update">
              Back to login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (mode === "update") {
    return (
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="pt-1">
          <form
            className="space-y-4"
            onSubmit={updateForm.handleSubmit(onUpdatePassword)}
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-tint text-primary">
              <KeyRound className="size-6" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={Boolean(updateForm.formState.errors.password)}
                  className="pr-10"
                  {...updateForm.register("password")}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide new password" : "Show new password"}
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {updateForm.formState.errors.password ? (
                <p className="text-xs text-danger">
                  {updateForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  aria-invalid={Boolean(
                    updateForm.formState.errors.confirmPassword,
                  )}
                  className="pr-10"
                  {...updateForm.register("confirmPassword")}
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmed password"
                      : "Show confirmed password"
                  }
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {updateForm.formState.errors.confirmPassword ? (
                <p className="text-xs text-danger">
                  {updateForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="h-11 w-full gap-2"
              aria-label="Update KOLLAB password"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating" : "Update password"}
              <KeyRound className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="pt-1">
        {mode === "sent" && sentTo ? (
          <div className="space-y-4 py-2">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-tint text-accent">
              <MailCheck className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Check your email</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                We sent reset instructions to {sentTo}.
              </p>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={requestForm.handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(requestForm.formState.errors.email)}
                {...requestForm.register("email")}
              />
              {requestForm.formState.errors.email ? (
                <p className="text-xs text-danger">
                  {requestForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="h-11 w-full gap-2"
              aria-label="Send password reset email"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending" : "Send reset email"}
              <MailCheck className="size-4" aria-hidden="true" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
