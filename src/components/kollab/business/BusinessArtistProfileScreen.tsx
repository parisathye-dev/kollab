"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, MapPin, Send, Star } from "lucide-react";
import { PortfolioGrid } from "@/components/kollab/artist/PortfolioGrid";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessShell } from "@/components/kollab/business/BusinessShell";
import { toast } from "@/hooks/use-toast";
import {
  getBusinessArtistProfile,
  getBusinessInviteGigs,
  inviteArtistToGig,
} from "@/lib/supabase/business";
import { skillLabel } from "@/lib/supabase/artist";
import type { PortfolioItemView } from "@/types/artist";
import type {
  BusinessArtistProfile,
  BusinessGigInviteOption,
} from "@/types/business";

type BusinessArtistProfileScreenProps = {
  artistId: string;
};

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
  return error instanceof Error ? error.message : "Unable to load artist.";
}

function toPortfolioGridItems(
  artist: BusinessArtistProfile,
): PortfolioItemView[] {
  return artist.portfolioItems.map((item) => ({
    ...item,
    createdAt: new Date().toISOString(),
  }));
}

export function BusinessArtistProfileScreen({
  artistId,
}: BusinessArtistProfileScreenProps) {
  const [artist, setArtist] = useState<BusinessArtistProfile | null>(null);
  const [activeGigs, setActiveGigs] = useState<BusinessGigInviteOption[]>([]);
  const [selectedGigId, setSelectedGigId] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    async function loadArtist() {
      try {
        const [result, gigs] = await Promise.all([
          getBusinessArtistProfile(artistId),
          getBusinessInviteGigs(),
        ]);
        setArtist(result);
        setActiveGigs(gigs);
        setSelectedGigId(gigs[0]?.id ?? "");
      } catch (error: unknown) {
        toast({
          title: "Profile unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadArtist();
  }, [artistId]);

  async function sendInvite() {
    if (!artist || !selectedGigId) {
      return;
    }

    try {
      setIsInviting(true);
      await inviteArtistToGig({
        artistId: artist.id,
        gigId: selectedGigId,
      });
      toast({
        title: "Invite sent",
        description: `${artist.displayName} can now review your brief.`,
      });
      setInviteOpen(false);
    } catch (error: unknown) {
      toast({
        title: "Invite failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  }

  if (!artist) {
    return (
      <BusinessShell title="Creator Profile">
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </BusinessShell>
    );
  }

  return (
    <BusinessShell title="Creator Profile">
      <section className="space-y-5">
        <Link
          href="/business/artists"
          aria-label="Back to artist discovery"
          className="inline-flex items-center gap-2 rounded-xl text-sm font-medium text-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Artist Discovery
        </Link>

        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="space-y-5 pt-1">
            <div className="flex items-start gap-4">
              {artist.avatarUrl ? (
                <img
                  src={artist.avatarUrl}
                  alt={`${artist.displayName} profile photo`}
                  className="size-20 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xl font-semibold text-secondary-foreground">
                  {getInitials(artist.displayName)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold">{artist.displayName}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {artist.locationText} · {artist.distanceKm.toFixed(1)} km
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {artist.skills.map((skill) => (
                    <Badge key={skill} className="bg-secondary-tint text-secondary">
                      {skillLabel(skill)}
                    </Badge>
                  ))}
                  {artist.customSkills.map((skill) => (
                    <Badge key={skill} className="bg-accent-tint text-accent">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">{artist.bio}</p>

            <div className="grid gap-2 rounded-2xl bg-[#FFF8F3] p-3 text-sm sm:grid-cols-2">
              {artist.details.age ? (
                <p>
                  <span className="font-medium">Age:</span> {artist.details.age}
                </p>
              ) : null}
              {artist.details.city ? (
                <p>
                  <span className="font-medium">City:</span> {artist.details.city}
                </p>
              ) : null}
              {artist.details.workStatus ? (
                <p className="sm:col-span-2">
                  <span className="font-medium">Work:</span>{" "}
                  {artist.details.workStatus}
                </p>
              ) : null}
              {artist.details.degree ? (
                <p className="sm:col-span-2">
                  <span className="font-medium">Degree:</span>{" "}
                  {artist.details.degree}
                </p>
              ) : null}
              {artist.details.expenses ? (
                <p className="sm:col-span-2">
                  <span className="font-medium">Gig goal:</span>{" "}
                  {artist.details.expenses}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-[#FFF8F3] p-3 text-center">
              <div>
                <p className="text-lg font-semibold">{artist.totalGigs}</p>
                <p className="text-xs text-muted-foreground">Gigs</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-semibold">
                  {artist.avgRating.toFixed(1)}
                  <Star className="size-4 fill-warning text-warning" aria-hidden="true" />
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{formatInr(artist.rateMin)}</p>
                <p className="text-xs text-muted-foreground">From</p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                aria-label={`Invite ${artist.displayName} to a gig`}
                className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                onClick={() => setInviteOpen(true)}
              >
                <Send className="size-4" aria-hidden="true" />
                Invite to Gig
              </Button>
              {artist.chatGigId ? (
                <Button asChild variant="outline" className="gap-2">
                  <Link
                    href={`/shared/chat/${artist.chatGigId}`}
                    aria-label={`Message ${artist.displayName}`}
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Message
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  aria-label={`Message ${artist.displayName}`}
                  onClick={() =>
                    toast({
                      title: "Chat unlocks after hiring",
                      description:
                        "Invite this creator to a gig and accept their application to start chat.",
                    })
                  }
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Message
                </Button>
              )}
            </div>
            {!artist.chatGigId ? (
              <p className="text-xs leading-5 text-muted-foreground">
                Chat opens after you hire this creator for a gig.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Portfolio</h2>
          <PortfolioGrid items={toPortfolioGridItems(artist)} readOnly />
        </section>
      </section>
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to Gig</DialogTitle>
            <DialogDescription>
              Choose which active brief to share with {artist.displayName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-invite-gig">Active gig</Label>
              <Select value={selectedGigId} onValueChange={setSelectedGigId}>
                <SelectTrigger
                  id="profile-invite-gig"
                  aria-label="Select gig for profile invite"
                  className="h-11 w-full"
                >
                  <SelectValue placeholder="Select gig" />
                </SelectTrigger>
                <SelectContent>
                  {activeGigs.map((gig) => (
                    <SelectItem key={gig.id} value={gig.id}>
                      {gig.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              aria-label="Send artist invite from profile"
              disabled={!selectedGigId || isInviting}
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={sendInvite}
            >
              {isInviting ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </BusinessShell>
  );
}
