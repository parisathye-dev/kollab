import type { Metadata } from "next";
import { AuthShell } from "@/components/kollab/auth/auth-shell";
import { RegisterForm } from "@/components/kollab/auth/register-form";

export const metadata: Metadata = {
  title: "Join KOLLAB",
  description:
    "Create a KOLLAB artist or business account for local creative collaborations.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Join KOLLAB"
      subtitle="Start by choosing how you want to collaborate."
    >
      <RegisterForm />
    </AuthShell>
  );
}
