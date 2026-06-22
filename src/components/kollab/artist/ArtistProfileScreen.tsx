"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Camera, Edit3, Moon, Sun, X } from "lucide-react";
import { ArtistCard } from "@/components/kollab/ArtistCard";
import { ArtistShell } from "@/components/kollab/artist/ArtistShell";
import { PortfolioGrid } from "@/components/kollab/artist/PortfolioGrid";
import { setKollabTheme } from "@/components/kollab/shared/ThemeInitializer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { uploadAvatarFile } from "@/lib/supabase/auth";
import {
  getArtistProfileData,
  skillLabel,
  updateArtistProfile,
} from "@/lib/supabase/artist";
import {
  artistProfileEditSchema,
  type ArtistProfileEditInput,
} from "@/lib/validation/artist";
import { normalizeCustomSkill } from "@/lib/utils/profile-details";
import { cn } from "@/lib/utils";
import type { ArtistProfileData, ArtistSkill } from "@/types/artist";

const skills: ArtistSkill[] = [
  "reel_editor",
  "photographer",
  "graphic_designer",
  "ui_ux",
  "motion_designer",
  "copywriter",
  "videographer",
  "illustrator",
];

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to update profile.";
}

export function ArtistProfileScreen() {
  const [data, setData] = useState<ArtistProfileData | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setData(await getArtistProfileData());
      } catch (error: unknown) {
        toast({
          title: "Profile unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadProfile();
  }, []);

  if (!data) {
    return (
      <ArtistShell title="Profile">
        <div className="h-72 animate-pulse rounded-2xl bg-white" />
      </ArtistShell>
    );
  }

  return (
    <ArtistShell title="Profile">
      <section className="space-y-5">
        <ArtistCard artist={data.artist} />

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm leading-6 text-muted-foreground">{data.bio}</p>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {data.details.age ? (
              <p>
                <span className="font-medium">Age:</span> {data.details.age}
              </p>
            ) : null}
            {data.details.city ? (
              <p>
                <span className="font-medium">City:</span> {data.details.city}
              </p>
            ) : null}
            {data.details.workStatus ? (
              <p className="sm:col-span-2">
                <span className="font-medium">Work:</span>{" "}
                {data.details.workStatus}
              </p>
            ) : null}
            {data.details.degree ? (
              <p className="sm:col-span-2">
                <span className="font-medium">Degree:</span>{" "}
                {data.details.degree}
              </p>
            ) : null}
            {data.details.expenses ? (
              <p className="sm:col-span-2">
                <span className="font-medium">Gig goal:</span>{" "}
                {data.details.expenses}
              </p>
            ) : null}
          </div>
          {data.details.customSkills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.details.customSkills.map((skill) => (
                <Badge key={skill} className="bg-accent-tint text-accent">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl bg-surface p-4">
            <div>
              <p className="text-xs text-muted-foreground">Rate card</p>
              <p className="text-lg font-semibold">
                from {formatInr(data.artist.rateMin)} per gig
              </p>
            </div>
            <Badge
              className={
                data.artist.isOpenToGigs
                  ? "bg-accent-tint text-accent"
                  : "bg-muted text-muted-foreground"
              }
            >
              {data.artist.isOpenToGigs ? "Open to Gigs" : "Paused"}
            </Badge>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Portfolio</h2>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  aria-label="Edit artist profile"
                >
                  <Edit3 className="size-4" aria-hidden="true" />
                  Edit Profile
                </Button>
              </SheetTrigger>
              <ProfileEditSheet
                data={data}
                onSaved={(nextData) => {
                  setData(nextData);
                  setSheetOpen(false);
                }}
              />
            </Sheet>
          </div>
          <PortfolioGrid items={data.portfolioItems} readOnly />
        </section>
      </section>
    </ArtistShell>
  );
}

function ProfileEditSheet({
  data,
  onSaved,
}: {
  data: ArtistProfileData;
  onSaved: (data: ArtistProfileData) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const form = useForm<ArtistProfileEditInput>({
    resolver: zodResolver(artistProfileEditSchema),
    defaultValues: {
      displayName: data.artist.displayName,
      bio: data.bio,
      age: data.details.age,
      city: data.details.city,
      workStatus: data.details.workStatus,
      expenses: data.details.expenses,
      degree: data.details.degree,
      customSkills: data.details.customSkills,
      appearance: data.details.appearance,
      avatarUrl: data.artist.avatarUrl ?? undefined,
      locationText: data.artist.locationText,
      skills: data.artist.skills,
      rateMin: data.artist.rateMin,
      isOpenToGigs: data.artist.isOpenToGigs,
    },
  });
  const selectedSkills = form.watch("skills");
  const customSkills = form.watch("customSkills");
  const isOpenToGigs = form.watch("isOpenToGigs");
  const appearance = form.watch("appearance");

  function toggleSkill(skill: ArtistSkill) {
    const nextSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((item) => item !== skill)
      : [...selectedSkills, skill];

    form.setValue("skills", nextSkills, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function addCustomSkill() {
    const nextSkill = normalizeCustomSkill(customSkillInput);

    if (!nextSkill) {
      return;
    }

    form.setValue("customSkills", [...customSkills, nextSkill], {
      shouldDirty: true,
      shouldValidate: true,
    });
    setCustomSkillInput("");
  }

  function removeCustomSkill(skill: string) {
    form.setValue(
      "customSkills",
      customSkills.filter((item) => item !== skill),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
  }

  async function onSubmit(values: ArtistProfileEditInput) {
    try {
      setIsSaving(true);
      let avatarUrl = values.avatarUrl;

      if (avatarFile) {
        avatarUrl = await uploadAvatarFile(avatarFile);
      }

      const nextData = await updateArtistProfile({
        ...values,
        avatarUrl,
      });
      setKollabTheme(values.appearance);
      onSaved(nextData);
    } catch (error: unknown) {
      toast({
        title: "Profile not saved",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Edit Profile</SheetTitle>
        <SheetDescription>
          Update how businesses see your creator profile.
        </SheetDescription>
      </SheetHeader>
      <form className="space-y-5 px-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="profileAvatar">Profile photo</Label>
          <label
            htmlFor="profileAvatar"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary-tint/60 p-4 text-sm transition-colors hover:bg-primary-tint"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Camera className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium">
                {avatarFile ? avatarFile.name : "Upload profile photo"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                JPG or PNG, max 5MB.
              </span>
            </span>
          </label>
          <input
            id="profileAvatar"
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            aria-label="Upload artist profile photo"
            onChange={onAvatarChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Name</Label>
          <Input
            id="displayName"
            aria-label="Display name"
            {...form.register("displayName")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            rows={4}
            aria-label="Artist bio"
            className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...form.register("bio")}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" aria-label="Artist age" {...form.register("age")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              aria-label="Artist city"
              {...form.register("city")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="workStatus">Study, job, or internship</Label>
          <Input
            id="workStatus"
            aria-label="Study job or internship"
            placeholder="Studying, working, interning, freelancing"
            {...form.register("workStatus")}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="degree">Degree</Label>
            <Input
              id="degree"
              aria-label="Artist degree"
              {...form.register("degree")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expenses">Gig goal</Label>
            <Input
              id="expenses"
              aria-label="Artist gig goal or expenses"
              placeholder="Gear, rent, commute"
              {...form.register("expenses")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="locationText">Location</Label>
          <Input
            id="locationText"
            aria-label="Artist location"
            {...form.register("locationText")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rateMin">Starting rate</Label>
          <Input
            id="rateMin"
            type="number"
            aria-label="Starting rate"
            {...form.register("rateMin", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Skills</Label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <button
                key={skill}
                type="button"
                aria-label={`Toggle ${skillLabel(skill)}`}
                aria-pressed={selectedSkills.includes(skill)}
                onClick={() => toggleSkill(skill)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium",
                  selectedSkills.includes(skill)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {skillLabel(skill)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              aria-label="Other skill"
              placeholder="Other skill"
              value={customSkillInput}
              onChange={(event) => setCustomSkillInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomSkill();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              aria-label="Add other skill"
              onClick={addCustomSkill}
            >
              Add
            </Button>
          </div>
          {customSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {customSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  aria-label={`Remove ${skill}`}
                  className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-3 py-2 text-sm font-medium text-accent"
                  onClick={() => removeCustomSkill(skill)}
                >
                  {skill}
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface p-4">
          <Label htmlFor="profileOpenToGigs">Open to Gigs</Label>
          <button
            id="profileOpenToGigs"
            type="button"
            aria-label="Toggle open to gigs"
            aria-pressed={isOpenToGigs}
            onClick={() =>
              form.setValue("isOpenToGigs", !isOpenToGigs, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            className={cn(
              "relative h-7 w-12 rounded-full",
              isOpenToGigs ? "bg-success" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-1 size-5 rounded-full bg-white transition-transform",
                isOpenToGigs ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
        </div>
        <div className="space-y-2">
          <Label>Appearance</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-label="Use light appearance"
              aria-pressed={appearance === "light"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium",
                appearance === "light"
                  ? "border-primary bg-primary-tint text-primary"
                  : "border-border bg-white text-foreground",
              )}
              onClick={() => {
                form.setValue("appearance", "light", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setKollabTheme("light");
              }}
            >
              <Sun className="size-4" aria-hidden="true" />
              Light
            </button>
            <button
              type="button"
              aria-label="Use dark appearance"
              aria-pressed={appearance === "dark"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium",
                appearance === "dark"
                  ? "border-primary bg-primary-tint text-primary"
                  : "border-border bg-white text-foreground",
              )}
              onClick={() => {
                form.setValue("appearance", "dark", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setKollabTheme("dark");
              }}
            >
              <Moon className="size-4" aria-hidden="true" />
              Dark
            </button>
          </div>
        </div>
        <SheetFooter className="px-0">
          <Button
            type="submit"
            aria-label="Save profile changes"
            disabled={isSaving}
          >
            {isSaving ? "Saving" : "Save profile"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}
