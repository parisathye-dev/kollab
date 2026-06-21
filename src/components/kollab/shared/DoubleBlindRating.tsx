"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { submitDoubleBlindRating } from "@/lib/supabase/shared";
import { cn } from "@/lib/utils";
import type { RatingState } from "@/types/shared";

type DoubleBlindRatingProps = {
  gigId: string;
  initialState: RatingState;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to submit rating.";
}

export function DoubleBlindRating({
  gigId,
  initialState,
}: DoubleBlindRatingProps) {
  const [state, setState] = useState(initialState);
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setState(initialState);
    setOpen(initialState.escrowReleased && !initialState.ownSubmitted);
  }, [initialState]);

  async function submitRating() {
    try {
      setSubmitting(true);
      const nextState = await submitDoubleBlindRating({
        gigId,
        stars,
        reviewText,
      });
      setState(nextState);
      setOpen(false);
      toast({
        title: "Rating submitted",
        description: "Your rating stays hidden until both sides submit.",
      });
    } catch (error: unknown) {
      toast({
        title: "Rating not submitted",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!state.escrowReleased) {
    return null;
  }

  return (
    <>
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="space-y-3 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Double-Blind Rating</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ratings stay private until both parties submit.
              </p>
            </div>
            <Badge className="bg-accent-tint text-accent">
              Escrow Released
            </Badge>
          </div>

          {state.visibleRatings.length > 0 ? (
            <div className="space-y-2">
              {state.visibleRatings.map((rating) => (
                <div key={rating.id} className="rounded-2xl bg-accent-tint p-3">
                  <p className="font-semibold">{rating.raterName}</p>
                  <p className="mt-1 flex items-center gap-1 text-warning">
                    {Array.from({ length: rating.stars }).map((_, index) => (
                      <Star
                        key={`${rating.id}-${index}`}
                        className="size-4 fill-warning"
                        aria-hidden="true"
                      />
                    ))}
                  </p>
                  {rating.reviewText ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {rating.reviewText}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : state.ownSubmitted ? (
            <p className="rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
              Waiting for the other party to rate...
            </p>
          ) : (
            <Button
              type="button"
              aria-label="Open rating modal"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setOpen(true)}
            >
              Rate this collaboration
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate this collaboration</DialogTitle>
            <DialogDescription>
              Your review becomes visible only after both sides submit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`Select ${value} stars`}
                  aria-pressed={stars === value}
                  className={cn(
                    "rounded-xl p-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/40",
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
              <Label htmlFor="double-blind-review">Review</Label>
              <textarea
                id="double-blind-review"
                aria-label="Optional review text"
                rows={4}
                maxLength={200}
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-accent/40"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {reviewText.length}/200 characters
              </p>
            </div>
            <Button
              type="button"
              aria-label="Submit double blind rating"
              disabled={submitting}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={submitRating}
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
