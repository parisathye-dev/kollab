import type { Metadata } from "next";
import { AuthShell } from "@/components/kollab/auth/auth-shell";
import { ResetPasswordForm } from "@/components/kollab/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | KOLLAB",
  description: "Request a secure password reset link for your KOLLAB account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email and we will send recovery instructions."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
