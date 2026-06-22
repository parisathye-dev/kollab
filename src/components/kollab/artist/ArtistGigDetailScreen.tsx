"use client";

import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  MapPin,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArtistShell } from "@/components/kollab/artist/ArtistShell";
import { toast } from "@/hooks/use-toast";
import {
  getGigDetail,
  skillLabel,
  submitArtistApplication,
} from "@/lib/supabase/artist";
import {
  applyForGigSchema,
  type ApplyForGigInput,
} from "@/lib/validation/artist";
import type { GigDetail } from "@/types/artist";

const GigMap = dynamic(
  () => import("@/components/kollab/artist/GigMap").then((mod) => mod.GigMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
        Loading map
      </div>
    ),
  },
);

type ArtistGigDetailScreenProps = {
  gigId: string;
};

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load gig.";
}

export function ArtistGigDetailScreen({ gigId }: ArtistGigDetailScreenProps) {
  const [gig, setGig] = useState<GigDetail | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function loadGig() {
      try {
        const result = await getGigDetail(gigId);
        setGig(result);
        setIsSubmitted(result.alreadyApplied);
      } catch (error: unknown) {
        toast({
          title: "Gig unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadGig();
  }, [gigId]);

  if (!gig) {
    return (
      <ArtistShell title="Gig detail">
        <div className="space-y-4">
          <div className="h-52 animate-pulse rounded-2xl bg-white" />
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      </ArtistShell>
    );
  }

  return (
    <ArtistShell title="Gig detail">
      <section className="space-y-4">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Badge className="bg-primary-tint text-primary">
                  {skillLabel(gig.skillRequired)}
                </Badge>
                <CardTitle className="text-2xl leading-tight">
                  {gig.title}
                </CardTitle>
                <CardDescription>{gig.businessName}</CardDescription>
              </div>
              {gig.matchesSkills ? (
                <Badge className="bg-accent-tint text-accent">
                  Matches 🎯
                </Badge>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">
              {gig.description}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface p-4">
                <IndianRupee className="mb-2 size-4 text-primary" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-semibold">
                  {formatInr(gig.budgetMin)} - {formatInr(gig.budgetMax)}
                </p>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <CalendarDays className="mb-2 size-4 text-primary" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-semibold">{formatDate(gig.deadline)}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-surface p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                {gig.locationText}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {gig.distanceKm.toFixed(1)} km away · {gig.workType.replace("_", " ")}
              </p>
            </div>
          </CardContent>
        </Card>

        <GigMap
          latitude={gig.latitude}
          longitude={gig.longitude}
          label={gig.locationText}
        />

        <ApplicationDialog
          gig={gig}
          isSubmitted={isSubmitted}
          onSubmitted={() => setIsSubmitted(true)}
        />
      </section>
    </ArtistShell>
  );
}

function ApplicationDialog({
  gig,
  isSubmitted,
  onSubmitted,
}: {
  gig: GigDetail;
  isSubmitted: boolean;
  onSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ApplyForGigInput>({
    resolver: zodResolver(applyForGigSchema),
    defaultValues: {
      gigId: gig.id,
      pitchText: "",
      quotedRate: gig.budgetMin,
      budgetMin: gig.budgetMin,
      budgetMax: gig.budgetMax,
    },
  });
  const pitchText = form.watch("pitchText");
  const pitchLength = pitchText.trim().length;

  async function onSubmit(values: ApplyForGigInput) {
    try {
      setIsSubmitting(true);
      await submitArtistApplication(values);
      onSubmitted();
      setOpen(false);
      toast({
        title: "Application Submitted ✅",
        description: "Your application is now in Recent Applications.",
      });
    } catch (error: unknown) {
      toast({
        title: "Application failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-12 w-full gap-2"
          aria-label="Apply for this gig"
          disabled={isSubmitted}
        >
          {isSubmitted ? (
            <>
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Application Submitted ✅
            </>
          ) : (
            "Apply for this Gig"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for this Gig</DialogTitle>
          <DialogDescription>
            Send your pitch to {gig.businessName}. Budget:{" "}
            {formatInr(gig.budgetMin)} - {formatInr(gig.budgetMax)}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <input type="hidden" {...form.register("gigId")} />
          <input type="hidden" {...form.register("budgetMin", { valueAsNumber: true })} />
          <input type="hidden" {...form.register("budgetMax", { valueAsNumber: true })} />

          <div className="space-y-2">
            <Label htmlFor="pitchText">Pitch</Label>
            <textarea
              id="pitchText"
              rows={5}
              aria-label="Application pitch"
              aria-invalid={Boolean(form.formState.errors.pitchText)}
              className="min-h-32 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Tell the business how you would approach this gig, your relevant work, and when you can deliver."
              {...form.register("pitchText")}
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Minimum 51 characters</span>
              <span>{pitchLength}/51</span>
            </div>
            {form.formState.errors.pitchText ? (
              <p className="text-xs text-danger">
                {form.formState.errors.pitchText.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quotedRate">Quoted rate</Label>
            <Input
              id="quotedRate"
              type="number"
              aria-label="Quoted rate in rupees"
              aria-invalid={Boolean(form.formState.errors.quotedRate)}
              {...form.register("quotedRate", { valueAsNumber: true })}
            />
            {form.formState.errors.quotedRate ? (
              <p className="text-xs text-danger">
                {form.formState.errors.quotedRate.message}
              </p>
            ) : null}
          </div>

          <DialogFooter className="sticky bottom-0 -mx-6 bg-background px-6 pb-1 pt-3">
            <Button
              type="submit"
              className="w-full gap-2"
              aria-label="Send application pitch to business"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending pitch" : "Send pitch to business"}
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
