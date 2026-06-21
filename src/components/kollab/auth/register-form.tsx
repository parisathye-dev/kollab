"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, BriefcaseBusiness, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { registerWithEmail } from "@/lib/supabase/auth";
import {
  profileRoleSchema,
  registerSchema,
  type ProfileRoleInput,
  type RegisterInput,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

const roleCards: Array<{
  role: ProfileRoleInput;
  title: string;
  description: string;
  icon: typeof Palette;
}> = [
  {
    role: "artist",
    title: "I'm a Creator 🎨",
    description: "Reels, shoots, decks, visuals, motion, words.",
    icon: Palette,
  },
  {
    role: "business",
    title: "I'm a Business 🏪",
    description: "Hire local creative talent for short-term gigs.",
    icon: BriefcaseBusiness,
  },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function RegisterForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<ProfileRoleInput | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "artist",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function selectRole(role: ProfileRoleInput) {
    const parsedRole = profileRoleSchema.parse(role);
    setSelectedRole(parsedRole);
    form.setValue("role", parsedRole, { shouldValidate: true });
  }

  async function onSubmit(values: RegisterInput) {
    try {
      setIsSubmitting(true);
      await registerWithEmail(values, window.location.origin);
      toast({
        title: "Welcome to KOLLAB",
        description: "Your account is ready. Finish your profile next.",
      });
      router.push("/onboarding");
    } catch (error: unknown) {
      toast({
        title: "Registration failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {roleCards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedRole === card.role;

          return (
            <button
              key={card.role}
              type="button"
              aria-label={`Select ${card.role} role`}
              aria-pressed={isSelected}
              onClick={() => selectRole(card.role)}
              className={cn(
                "rounded-xl text-left transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isSelected
                  ? "ring-2 ring-primary"
                  : "hover:-translate-y-0.5 hover:ring-1 hover:ring-primary/40",
              )}
            >
              <Card
                className={cn(
                  "min-h-40 border-0 bg-white shadow-sm",
                  isSelected && "bg-primary-tint",
                )}
              >
                <CardHeader>
                  <div
                    className={cn(
                      "mb-2 flex size-10 items-center justify-center rounded-xl",
                      card.role === "artist"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </button>
          );
        })}
      </div>

      {selectedRole ? (
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="pt-1">
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <input type="hidden" {...form.register("role")} />

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  autoComplete="name"
                  aria-invalid={Boolean(form.formState.errors.fullName)}
                  {...form.register("fullName")}
                />
                {form.formState.errors.fullName ? (
                  <p className="text-xs text-danger">
                    {form.formState.errors.fullName.message}
                  </p>
                ) : null}
              </div>

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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(form.formState.errors.password)}
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <p className="text-xs text-danger">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword ? (
                  <p className="text-xs text-danger">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                className="h-11 w-full gap-2"
                aria-label="Create KOLLAB account"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account" : "Create account"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
