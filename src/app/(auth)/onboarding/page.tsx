import type { Metadata } from "next";
import { AuthShell } from "@/components/kollab/auth/auth-shell";
import { OnboardingForm } from "@/components/kollab/auth/onboarding-form";

export const metadata: Metadata = {
  title: "Onboarding | KOLLAB",
  description:
    "Complete your KOLLAB profile so the marketplace can route the right gigs.",
};

export default function OnboardingPage() {
  return (
    <AuthShell
      title="Complete onboarding"
      subtitle="A few details help KOLLAB route the right opportunities."
    >
      <OnboardingForm />
    </AuthShell>
  );
}
