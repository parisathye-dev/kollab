"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { sendPasswordResetEmail } from "@/lib/supabase/auth";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/auth";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to send reset instructions.";
}

export function ResetPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ResetPasswordInput) {
    try {
      setIsSubmitting(true);
      await sendPasswordResetEmail(values, window.location.origin);
      setSentTo(values.email);
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

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="pt-1">
        {sentTo ? (
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
