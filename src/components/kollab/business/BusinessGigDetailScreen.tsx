"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Edit3, IndianRupee, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BusinessShell } from "@/components/kollab/business/BusinessShell";
import { toast } from "@/hooks/use-toast";
import {
  acceptBusinessApplication,
  getBusinessGigDetail,
} from "@/lib/supabase/business";
import { skillLabel } from "@/lib/supabase/artist";
import { cn } from "@/lib/utils";
import type {
  BusinessApplication,
  BusinessGigDetailData,
} from "@/types/business";
import type { GigStatus } from "@/types/database";

type BusinessGigDetailScreenProps = {
  gigId: string;
};

const pipeline: { status: GigStatus; label: string }[] = [
  { status: "live", label: "Live" },
  { status: "in_progress", label: "In Progress" },
  { status: "under_review", label: "Under Review" },
  { status: "completed", label: "Completed" },
];

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load gig.";
}

function pipelineIndex(status: GigStatus): number {
  const index = pipeline.findIndex((item) => item.status === status);

  return index >= 0 ? index : 0;
}

export function BusinessGigDetailScreen({ gigId }: BusinessGigDetailScreenProps) {
  const [data, setData] = useState<BusinessGigDetailData | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  useEffect(() => {
    async function loadGig() {
      try {
        const result = await getBusinessGigDetail(gigId);
        setData(result);
        setDraftTitle(result.gig.title);
        setDraftDescription(result.gig.description);
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

  async function acceptApplication(application: BusinessApplication) {
    try {
      setAcceptingId(application.id);
      await acceptBusinessApplication({ applicationId: application.id });
      setData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          gig: { ...current.gig, status: "in_progress" },
          escrow: {
            id: "new-escrow",
            status: "held",
            amountHeld: application.quotedRate,
            artistPayout: Math.round(application.quotedRate * 0.9),
          },
          applications: current.applications.map((item) => ({
            ...item,
            status:
              item.id === application.id
                ? "accepted"
                : item.status === "pending"
                  ? "rejected"
                  : item.status,
          })),
        };
      });
      toast({
        title: "Application accepted",
        description: "Escrow is held and the gig is now in progress.",
      });
    } catch (error: unknown) {
      toast({
        title: "Application not accepted",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setAcceptingId(null);
    }
  }

  function declineApplication(applicationId: string) {
    setData((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        applications: current.applications.map((application) =>
          application.id === applicationId
            ? { ...application, status: "rejected" }
            : application,
        ),
      };
    });
  }

  function saveDraftEdits() {
    setData((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        gig: {
          ...current.gig,
          title: draftTitle,
          description: draftDescription,
        },
      };
    });
    toast({
      title: "Draft edits saved",
      description: "The local preview has been updated.",
    });
  }

  if (!data) {
    return (
      <BusinessShell title="Gig Detail">
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </BusinessShell>
    );
  }

  const activeStep = pipelineIndex(data.gig.status);

  return (
    <BusinessShell title="Gig Detail">
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/business/home"
            aria-label="Back to business home"
            className="inline-flex items-center gap-2 rounded-xl text-sm font-medium text-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Dashboard
          </Link>
          {data.gig.status === "under_review" ? (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link
                href={`/business/gig/${data.gig.id}/review`}
                aria-label="Review submitted work"
              >
                Review Work
              </Link>
            </Button>
          ) : null}
        </div>

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="space-y-5 pt-1">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge className="bg-secondary-tint text-secondary">
                  {skillLabel(data.gig.skillRequired)}
                </Badge>
                <h1 className="text-2xl font-semibold">{data.gig.title}</h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  {data.gig.description}
                </p>
              </div>
              {data.gig.status === "live" ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      aria-label="Edit live gig"
                      variant="outline"
                      className="shrink-0 bg-white"
                    >
                      <Edit3 className="size-4" aria-hidden="true" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-3xl">
                    <SheetHeader>
                      <SheetTitle>Edit Live Gig</SheetTitle>
                    </SheetHeader>
                    <div className="mt-5 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          aria-label="Edit gig title"
                          value={draftTitle}
                          onChange={(event) => setDraftTitle(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <textarea
                          id="edit-description"
                          aria-label="Edit gig description"
                          rows={5}
                          className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
                          value={draftDescription}
                          onChange={(event) =>
                            setDraftDescription(event.target.value)
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        aria-label="Save gig edits"
                        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        onClick={saveDraftEdits}
                      >
                        Save Edits
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div className="rounded-2xl bg-[#FFF8F3] p-3">
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="mt-1 font-semibold">
                  {formatInr(data.gig.budgetMin)} - {formatInr(data.gig.budgetMax)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#FFF8F3] p-3">
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="mt-1 flex items-center gap-1 font-semibold">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {data.gig.deadline}
                </p>
              </div>
              <div className="rounded-2xl bg-accent-tint p-3">
                <p className="text-xs text-accent">Applicants</p>
                <p className="mt-1 font-semibold">{data.gig.applicantCount}</p>
              </div>
              <div className="rounded-2xl bg-accent-tint p-3">
                <p className="text-xs text-accent">Work Type</p>
                <p className="mt-1 capitalize">{data.gig.workType.replace("_", " ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="pt-1">
            <h2 className="text-lg font-semibold">Status Pipeline</h2>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {pipeline.map((item, index) => (
                <div
                  key={item.status}
                  className={cn(
                    "rounded-2xl px-2 py-3 text-center text-xs font-semibold",
                    index <= activeStep
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Applications Inbox</h2>
          {data.applications.length > 0 ? (
            data.applications.map((application) => (
              <Card key={application.id} className="border-0 bg-white shadow-sm">
                <CardContent className="space-y-4 pt-1">
                  <div className="flex items-start gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-secondary-foreground">
                      {getInitials(application.artist.displayName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {application.artist.displayName}
                          </h3>
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star
                              className="size-3.5 fill-warning text-warning"
                              aria-hidden="true"
                            />
                            {application.artist.avgRating.toFixed(1)} ·{" "}
                            {application.artist.totalGigs} gigs
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            application.status === "accepted" &&
                              "bg-accent-tint text-accent",
                            application.status === "pending" &&
                              "bg-secondary-tint text-secondary",
                            application.status === "rejected" &&
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {application.pitchText}
                  </p>
                  <div className="flex items-center justify-between rounded-2xl bg-[#FFF8F3] p-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <IndianRupee className="size-4" aria-hidden="true" />
                      Quoted Rate
                    </span>
                    <span className="font-semibold">
                      {formatInr(application.quotedRate)}
                    </span>
                  </div>

                  {application.status === "pending" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        aria-label={`Accept ${application.artist.displayName}`}
                        disabled={acceptingId === application.id}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        onClick={() => acceptApplication(application)}
                      >
                        {acceptingId === application.id ? "Accepting..." : "Accept"}
                      </Button>
                      <Button
                        type="button"
                        aria-label={`Decline ${application.artist.displayName}`}
                        variant="outline"
                        onClick={() => declineApplication(application.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="pt-1 text-sm text-muted-foreground">
                New artist proposals will appear here.
              </CardContent>
            </Card>
          )}
        </section>
      </section>
    </BusinessShell>
  );
}
