"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  getCurrentProfile,
  saveArtistOnboarding,
  saveBusinessOnboarding,
  uploadAvatarFile,
} from "@/lib/supabase/auth";
import {
  artistOnboardingSchema,
  businessOnboardingSchema,
  type ArtistOnboardingInput,
  type ArtistSkillInput,
  type BusinessOnboardingInput,
  type BusinessTypeInput,
  type ProfileRoleInput,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

type OnboardingProfile = {
  displayName: string;
  role: ProfileRoleInput;
};

const artistSkills: Array<{
  value: ArtistSkillInput;
  label: string;
}> = [
  { value: "reel_editor", label: "🎬 Reel Editor" },
  { value: "photographer", label: "📸 Photographer" },
  { value: "graphic_designer", label: "✏️ Graphic Designer" },
  { value: "ui_ux", label: "🖥️ UI/UX" },
  { value: "motion_designer", label: "🎵 Motion Designer" },
  { value: "copywriter", label: "✍️ Copywriter" },
  { value: "videographer", label: "🎥 Videographer" },
  { value: "illustrator", label: "🎨 Illustrator" },
];

const businessTypes: Array<{
  value: BusinessTypeInput;
  label: string;
}> = [
  { value: "cafe", label: "Cafe" },
  { value: "boutique", label: "Boutique" },
  { value: "hotel", label: "Hotel" },
  { value: "startup", label: "Startup" },
  { value: "restaurant", label: "Restaurant" },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function OnboardingForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await getCurrentProfile();
        setProfile({
          displayName: result.profile.display_name,
          role: result.profile.role,
        });
      } catch (error: unknown) {
        toast({
          title: "Sign in required",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();
  }, [router]);

  if (isLoading) {
    return (
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading your profile
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Welcome, {profile.displayName}. Complete the details below.
      </p>
      {profile.role === "artist" ? (
        <ArtistOnboardingPanel />
      ) : (
        <BusinessOnboardingPanel />
      )}
    </div>
  );
}

function ArtistOnboardingPanel() {
  const router = useRouter();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ArtistOnboardingInput>({
    resolver: zodResolver(artistOnboardingSchema),
    defaultValues: {
      location_text: "",
      skills: [],
      rate_min: 5000,
      rate_max: 15000,
      is_open_to_gigs: true,
    },
  });
  const selectedSkills = form.watch("skills");
  const rateMin = form.watch("rate_min");
  const rateMax = form.watch("rate_max");
  const isOpenToGigs = form.watch("is_open_to_gigs");

  function toggleSkill(skill: ArtistSkillInput) {
    const nextSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((item) => item !== skill)
      : [...selectedSkills, skill];

    form.setValue("skills", nextSkills, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
  }

  async function onSubmit(values: ArtistOnboardingInput) {
    try {
      setIsSubmitting(true);
      let avatarUrl = values.avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadAvatarFile(avatarFile);
      }

      const homePath = await saveArtistOnboarding({
        ...values,
        avatar_url: avatarUrl,
      });

      router.replace(homePath);
    } catch (error: unknown) {
      toast({
        title: "Could not save profile",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Creator profile</CardTitle>
        <CardDescription>
          Set how local businesses discover and book you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar</Label>
            <label
              htmlFor="avatar"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary-tint/60 p-4 text-sm transition-colors hover:bg-primary-tint"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Upload className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">
                  {avatarFile ? avatarFile.name : "Upload avatar"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  PNG or JPG, up to 5MB
                </span>
              </span>
            </label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Upload avatar image"
              onChange={onAvatarChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artistLocation">Location</Label>
            <Input
              id="artistLocation"
              placeholder="Thane West, Maharashtra"
              aria-invalid={Boolean(form.formState.errors.location_text)}
              {...form.register("location_text")}
            />
            {form.formState.errors.location_text ? (
              <p className="text-xs text-danger">
                {form.formState.errors.location_text.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2">
              {artistSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.value);

                return (
                  <button
                    key={skill.value}
                    type="button"
                    aria-label={`Toggle ${skill.label}`}
                    aria-pressed={isSelected}
                    onClick={() => toggleSkill(skill.value)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white text-foreground hover:border-primary/50",
                    )}
                  >
                    {skill.label}
                  </button>
                );
              })}
            </div>
            {form.formState.errors.skills ? (
              <p className="text-xs text-danger">
                {form.formState.errors.skills.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label>Rate range per gig</Label>
              <span className="text-sm font-medium text-primary">
                {formatInr(rateMin)} - {formatInr(rateMax)}
              </span>
            </div>
            <div className="space-y-4 rounded-xl bg-surface p-4">
              <div className="space-y-2">
                <Label htmlFor="rateMin" className="text-xs">
                  Minimum
                </Label>
                <Input
                  id="rateMin"
                  type="range"
                  min={0}
                  max={100000}
                  step={1000}
                  aria-label="Minimum gig rate"
                  {...form.register("rate_min", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rateMax" className="text-xs">
                  Maximum
                </Label>
                <Input
                  id="rateMax"
                  type="range"
                  min={0}
                  max={150000}
                  step={1000}
                  aria-label="Maximum gig rate"
                  {...form.register("rate_max", { valueAsNumber: true })}
                />
              </div>
            </div>
            {form.formState.errors.rate_max ? (
              <p className="text-xs text-danger">
                {form.formState.errors.rate_max.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4">
            <div>
              <Label htmlFor="openToGigs">Open to Gigs</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Let businesses invite you to active briefs.
              </p>
            </div>
            <button
              id="openToGigs"
              type="button"
              aria-label="Toggle open to gigs"
              aria-pressed={isOpenToGigs}
              onClick={() =>
                form.setValue("is_open_to_gigs", !isOpenToGigs, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className={cn(
                "relative h-7 w-12 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isOpenToGigs ? "bg-accent" : "bg-muted",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform",
                  isOpenToGigs ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>

          <Button
            type="submit"
            className="h-11 w-full gap-2"
            aria-label="Save artist onboarding"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving profile" : "Save and continue"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function BusinessOnboardingPanel() {
  const router = useRouter();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<BusinessOnboardingInput>({
    resolver: zodResolver(businessOnboardingSchema),
    defaultValues: {
      business_name: "",
      business_type: "cafe",
      location_text: "",
    },
  });

  async function onSubmit(values: BusinessOnboardingInput) {
    try {
      setIsSubmitting(true);
      let avatarUrl = values.avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadAvatarFile(avatarFile);
      }

      const homePath = await saveBusinessOnboarding({
        ...values,
        avatar_url: avatarUrl,
      });
      router.replace(homePath);
    } catch (error: unknown) {
      toast({
        title: "Could not save business",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
  }

  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Business profile</CardTitle>
        <CardDescription>
          Tell creators who they will collaborate with.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="businessAvatar">Logo or profile photo</Label>
            <label
              htmlFor="businessAvatar"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-secondary/40 bg-secondary-tint/60 p-4 text-sm transition-colors hover:bg-secondary-tint"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Upload className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">
                  {avatarFile ? avatarFile.name : "Upload logo"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  JPG or PNG, max 5MB.
                </span>
              </span>
            </label>
            <input
              id="businessAvatar"
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              aria-label="Upload business logo"
              onChange={onAvatarChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              placeholder="KOLLAB Cafe"
              aria-invalid={Boolean(form.formState.errors.business_name)}
              {...form.register("business_name")}
            />
            {form.formState.errors.business_name ? (
              <p className="text-xs text-danger">
                {form.formState.errors.business_name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Business type</Label>
            <Select
              value={form.watch("business_type")}
              onValueChange={(value: BusinessTypeInput) =>
                form.setValue("business_type", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger
                className="h-10 w-full"
                aria-label="Select business type"
              >
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.business_type ? (
              <p className="text-xs text-danger">
                {form.formState.errors.business_type.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessLocation">Location</Label>
            <Input
              id="businessLocation"
              placeholder="Bandra West, Mumbai"
              aria-invalid={Boolean(form.formState.errors.location_text)}
              {...form.register("location_text")}
            />
            {form.formState.errors.location_text ? (
              <p className="text-xs text-danger">
                {form.formState.errors.location_text.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="h-11 w-full gap-2"
            aria-label="Save business onboarding"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving profile" : "Save and continue"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
