import type { Metadata } from "next";
import { AuthShell } from "@/components/kollab/auth/auth-shell";
import { LoginForm } from "@/components/kollab/auth/login-form";

export const metadata: Metadata = {
  title: "Login | KOLLAB",
  description: "Sign in to KOLLAB to manage gigs, messages, and collaborations.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage gigs, messages, and collaborations."
    >
      <LoginForm />
    </AuthShell>
  );
}
