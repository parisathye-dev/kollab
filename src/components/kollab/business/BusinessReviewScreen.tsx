"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  MessageSquare,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { BusinessShell } from "@/components/kollab/business/BusinessShell";
import { toast } from "@/hooks/use-toast";
import {
  getBusinessReviewData,
  submitBusinessReviewAction,
} from "@/lib/supabase/business";
import { cn } from "@/lib/utils";
import type { BusinessDeliverable, BusinessReviewData } from "@/types/business";

type BusinessReviewScreenProps = {
  gigId: string;
};

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to review work.";
}

function deliverableLabel(deliverable: BusinessDeliverable): string {
  if (deliverable.type === "video") {
    return "Video";
  }

  if (deliverable.type === "image") {
    return "Image";
  }

  if (deliverable.type === "pdf") {
    return "PDF";
  }

  return "Link";
}

export function BusinessReviewScreen({ gigId }: BusinessReviewScreenProps) {
  const [data, setData] = useState<BusinessReviewData | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [disputeNote, setDisputeNote] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviewData() {
      try {
        const result = await getBusinessReviewData(gigId);
        setData(result);
      } catch (error: unknown) {
        toast({
          title: "Review unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadReviewData();
  }, [gigId]);

  async function approveWork() {
    if (!data) {
      return;
    }

    try {
      setBusyAction("approve");
      await submitBusinessReviewAction({
        gigId: data.gig.id,
        action: "approve",
        message: "",
        stars,
        reviewText,
      });
      setData({
        ...data,
        gig: { ...data.gig, status: "completed" },
        escrow: { ...data.escrow, status: "released" },
      });
      setRatingOpen(false);
      toast({
        title: "Payment released",
        description: "The artist has been rated and escrow is released.",
      });
    } catch (error: unknown) {
      toast({
        title: "Approval failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function requestRevision() {
    if (!data) {
      return;
    }

    try {
      setBusyAction("revision");
      await submitBusinessReviewAction({
        gigId: data.gig.id,
        action: "revision",
        message: revisionNote,
      });
      toast({
        title: "Revision requested",
        description: "The gig remains under review while the artist revises.",
      });
    } catch (error: unknown) {
      toast({
        title: "Revision not sent",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function raiseDispute() {
    if (!data) {
      return;
    }

    try {
      setBusyAction("dispute");
      await submitBusinessReviewAction({
        gigId: data.gig.id,
        action: "dispute",
        message: disputeNote,
      });
      setData({
        ...data,
        escrow: { ...data.escrow, status: "disputed" },
      });
      toast({
        title: "Dispute raised",
        description: "KOLLAB team has been alerted for review.",
      });
    } catch (error: unknown) {
      toast({
        title: "Dispute not raised",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  }

  if (!data) {
    return (
      <BusinessShell title="Work Review">
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </BusinessShell>
    );
  }

  return (
    <BusinessShell title="Work Review">
      <section className="space-y-5">
        <Link
          href={`/business/gig/${data.gig.id}`}
          aria-label="Back to gig detail"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-medium text-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Gig Detail
        </Link>

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="space-y-4 pt-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className="bg-accent-tint text-accent">Under Review</Badge>
                <h1 className="mt-2 text-2xl font-semibold">{data.gig.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submitted by {data.artist.displayName}
                </p>
              </div>
              <div className="rounded-2xl bg-[#FFF8F3] p-3 text-right">
                <p className="text-xs text-muted-foreground">Escrow</p>
                <p className="font-semibold">{formatInr(data.escrow.amountHeld)}</p>
                <p className="text-xs capitalize text-accent">{data.escrow.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Submitted Deliverables</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {data.deliverables.map((deliverable) => (
              <Card key={deliverable.id} className="border-0 bg-white shadow-sm">
                <CardContent className="space-y-3 pt-1">
                  <div className="flex h-28 items-center justify-center rounded-2xl bg-[#FFF8F3] text-secondary">
                    <FileText className="size-8" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold">{deliverable.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {deliverableLabel(deliverable)}
                    </p>
                  </div>
                  {deliverable.url.startsWith("demo://") ? (
                    <Badge variant="outline">Demo preview</Badge>
                  ) : (
                    <Button asChild variant="outline" className="w-full">
                      <a
                        href={deliverable.url}
                        aria-label={`Open ${deliverable.title}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open File
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-4 pt-1">
              <CheckCircle2 className="size-6 text-accent" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">Approve & Release Payment</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Release escrow and rate the artist.
                </p>
              </div>
              <Button
                type="button"
                aria-label="Approve work and release payment"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setRatingOpen(true)}
              >
                Approve
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-4 pt-1">
              <MessageSquare className="size-6 text-secondary" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">Request Revision</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Send clear notes; status stays under review.
                </p>
              </div>
              <textarea
                aria-label="Revision message"
                rows={4}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
                placeholder="Describe exactly what needs revision."
                value={revisionNote}
                onChange={(event) => setRevisionNote(event.target.value)}
              />
              <Button
                type="button"
                aria-label="Request revision"
                disabled={busyAction === "revision"}
                variant="outline"
                className="w-full"
                onClick={requestRevision}
              >
                {busyAction === "revision" ? "Sending..." : "Request Revision"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-4 pt-1">
              <AlertTriangle className="size-6 text-danger" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">Raise Dispute</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mark escrow as disputed and alert KOLLAB.
                </p>
              </div>
              <textarea
                aria-label="Dispute message"
                rows={4}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-danger/30"
                placeholder="Summarize the issue for the KOLLAB team."
                value={disputeNote}
                onChange={(event) => setDisputeNote(event.target.value)}
              />
              <Button
                type="button"
                aria-label="Raise dispute"
                disabled={busyAction === "dispute"}
                variant="destructive"
                className="w-full"
                onClick={raiseDispute}
              >
                {busyAction === "dispute" ? "Raising..." : "Raise Dispute"}
              </Button>
            </CardContent>
          </Card>
        </section>
      </section>

      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate the Artist</DialogTitle>
            <DialogDescription>
              Rating is saved with payment release.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Rate ${value} stars`}
                  aria-pressed={stars === value}
                  className={cn(
                    "rounded-xl p-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40",
                    value <= stars ? "text-warning" : "text-muted-foreground",
                  )}
                  onClick={() => setStars(value)}
                >
                  <Star
                    className={cn("size-7", value <= stars && "fill-warning")}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-text">Review note</Label>
              <textarea
                id="review-text"
                aria-label="Rating review text"
                rows={4}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
              />
            </div>
            <Button
              type="button"
              aria-label="Confirm approval and release payment"
              disabled={busyAction === "approve"}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={approveWork}
            >
              {busyAction === "approve" ? "Releasing..." : "Approve & Release Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </BusinessShell>
  );
}
