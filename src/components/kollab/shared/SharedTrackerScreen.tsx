"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  MessageCircle,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DoubleBlindRating } from "@/components/kollab/shared/DoubleBlindRating";
import { SharedShell } from "@/components/kollab/shared/SharedShell";
import { toast } from "@/hooks/use-toast";
import {
  getSharedTrackerData,
  submitArtistWork,
} from "@/lib/supabase/shared";
import { cn } from "@/lib/utils";
import type { SharedTrackerData, TrackerStep } from "@/types/shared";

type SharedTrackerScreenProps = {
  gigId: string;
};

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function daysRemaining(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${deadline}T00:00:00`);

  return Math.max(
    0,
    Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load tracker.";
}

function stepClasses(step: TrackerStep): string {
  if (step.tone === "green") {
    return "border-success bg-success text-white";
  }

  if (step.tone === "orange") {
    return "border-secondary bg-secondary text-secondary-foreground";
  }

  if (step.tone === "yellow") {
    return "border-warning bg-warning text-white";
  }

  if (step.tone === "teal") {
    return "border-accent bg-accent text-accent-foreground";
  }

  return "border-muted bg-muted text-muted-foreground";
}

function TrackerStepRow({ step, isLast }: { step: TrackerStep; isLast: boolean }) {
  return (
    <div className="relative flex gap-4">
      {!isLast ? (
        <div className="absolute left-5 top-10 h-full w-px bg-border" />
      ) : null}
      <div
        className={cn(
          "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold",
          stepClasses(step),
          step.state === "active" && step.tone === "orange" && "animate-pulse",
        )}
      >
        {step.state === "done" ? (
          <CheckCircle2 className="size-5" aria-hidden="true" />
        ) : (
          <Clock3 className="size-5" aria-hidden="true" />
        )}
      </div>
      <div className="pb-8">
        <p className="font-semibold">{step.label}</p>
        <p className="mt-1 text-sm capitalize text-muted-foreground">
          {step.state === "active" ? "Currently active" : step.state}
        </p>
      </div>
    </div>
  );
}

export function SharedTrackerScreen({ gigId }: SharedTrackerScreenProps) {
  const [data, setData] = useState<SharedTrackerData | null>(null);
  const [submittingWork, setSubmittingWork] = useState(false);

  useEffect(() => {
    async function loadTracker() {
      try {
        const result = await getSharedTrackerData(gigId);
        setData(result);
      } catch (error: unknown) {
        toast({
          title: "Tracker unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadTracker();
  }, [gigId]);

  async function submitWork() {
    if (!data) {
      return;
    }

    try {
      setSubmittingWork(true);
      await submitArtistWork(data.gig.id);
      const result = await getSharedTrackerData(data.gig.id);
      setData({
        ...result,
        gig: { ...result.gig, status: "under_review" },
      });
      toast({
        title: "Work submitted",
        description: "The business can now review and approve the gig.",
      });
    } catch (error: unknown) {
      toast({
        title: "Work not submitted",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSubmittingWork(false);
    }
  }

  if (!data) {
    return (
      <SharedShell title="Gig Tracker">
        <div className="h-96 animate-pulse rounded-3xl bg-white" />
      </SharedShell>
    );
  }

  const remainingDays = daysRemaining(data.gig.deadline);
  const artistCanSubmit =
    data.currentUser.role === "artist" && data.gig.status === "in_progress";
  const businessCanReview =
    data.currentUser.role === "business" && data.gig.status === "under_review";

  return (
    <SharedShell title="Gig Tracker">
      <section className="mx-auto max-w-3xl space-y-5">
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="space-y-3 pt-1">
            <Badge className="bg-accent-tint text-accent">Gig Progress</Badge>
            <h1 className="text-2xl font-semibold">{data.gig.title}</h1>
            <p className="text-sm text-muted-foreground">
              Tracking with {data.otherParty.name}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="pt-1">
            {data.steps.map((step, index) => (
              <TrackerStepRow
                key={step.key}
                step={step}
                isLast={index === data.steps.length - 1}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 bg-accent text-accent-foreground shadow-sm">
          <CardContent className="flex items-center justify-between gap-4 pt-1">
            <div>
              <p className="text-sm text-white/80">Escrow Status</p>
              <p className="mt-1 text-2xl font-semibold">
                {formatInr(data.escrow.amountHeld)} held safely by KOLLAB 🔒
              </p>
              <p className="mt-1 text-sm text-white/80 capitalize">
                {data.escrow.status}
              </p>
            </div>
            <ShieldCheck className="size-10 shrink-0" aria-hidden="true" />
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-3 pt-1">
              <p className="flex items-center gap-2 font-semibold">
                <Clock3 className="size-5 text-warning" aria-hidden="true" />
                Deadline Countdown
              </p>
              <p
                className={cn(
                  "text-2xl font-semibold",
                  remainingDays < 5 ? "text-warning" : "text-foreground",
                )}
              >
                {remainingDays} days remaining
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-3 pt-1">
              <p className="flex items-center gap-2 font-semibold">
                <IndianRupee className="size-5 text-accent" aria-hidden="true" />
                Quick Actions
              </p>
              <div className="grid gap-2">
                {artistCanSubmit ? (
                  <Button
                    type="button"
                    aria-label="Submit my work"
                    disabled={submittingWork}
                    className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={submitWork}
                  >
                    <UploadCloud className="size-4" aria-hidden="true" />
                    {submittingWork ? "Submitting..." : "Submit My Work"}
                  </Button>
                ) : null}
                {businessCanReview ? (
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link
                      href={`/business/gig/${data.gig.id}/review`}
                      aria-label="Review and approve work"
                    >
                      Review & Approve
                    </Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline">
                  <Link
                    href={`/shared/chat/${data.gig.id}`}
                    aria-label="Open chat"
                    className="gap-2"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Open Chat
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DoubleBlindRating
          gigId={data.gig.id}
          initialState={data.ratingState}
        />
      </section>
    </SharedShell>
  );
}
