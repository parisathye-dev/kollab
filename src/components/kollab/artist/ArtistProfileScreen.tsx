"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit3 } from "lucide-react";
import { ArtistCard } from "@/components/kollab/ArtistCard";
import { ArtistShell } from "@/components/kollab/artist/ArtistShell";
import { PortfolioGrid } from "@/components/kollab/artist/PortfolioGrid";
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
import {
  getArtistProfileData,
  skillLabel,
  updateArtistProfile,
} from "@/lib/supabase/artist";
import {
  artistProfileEditSchema,
  type ArtistProfileEditInput,
} from "@/lib/validation/artist";
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
  const form = useForm<ArtistProfileEditInput>({
    resolver: zodResolver(artistProfileEditSchema),
    defaultValues: {
      displayName: data.artist.displayName,
      bio: data.bio,
      locationText: data.artist.locationText,
      skills: data.artist.skills,
      rateMin: data.artist.rateMin,
      isOpenToGigs: data.artist.isOpenToGigs,
    },
  });
  const selectedSkills = form.watch("skills");
  const isOpenToGigs = form.watch("isOpenToGigs");

  function toggleSkill(skill: ArtistSkill) {
    const nextSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((item) => item !== skill)
      : [...selectedSkills, skill];

    form.setValue("skills", nextSkills, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: ArtistProfileEditInput) {
    try {
      setIsSaving(true);
      onSaved(await updateArtistProfile(values));
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
