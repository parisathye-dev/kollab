"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, MapPin, Send, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessShell } from "@/components/kollab/business/BusinessShell";
import { toast } from "@/hooks/use-toast";
import { getBusinessArtistProfile } from "@/lib/supabase/business";
import { skillLabel } from "@/lib/supabase/artist";
import type { BusinessArtistProfile } from "@/types/business";

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

export function BusinessArtistProfileScreen({
  artistId,
}: BusinessArtistProfileScreenProps) {
  const [artist, setArtist] = useState<BusinessArtistProfile | null>(null);

  useEffect(() => {
    async function loadArtist() {
      try {
        const result = await getBusinessArtistProfile(artistId);
        setArtist(result);
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
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xl font-semibold text-secondary-foreground">
                {getInitials(artist.displayName)}
              </div>
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
                </div>
              </div>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">{artist.bio}</p>

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

            <Button
              type="button"
              aria-label={`Invite ${artist.displayName} to a gig`}
              className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() =>
                toast({
                  title: "Invite from discovery",
                  description: "Use Artist Discovery to choose the exact gig.",
                })
              }
            >
              <Send className="size-4" aria-hidden="true" />
              Invite to Gig
            </Button>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Portfolio</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {artist.portfolioItems.length > 0 ? (
              artist.portfolioItems.map((item) => (
                <Card key={item.id} className="border-0 bg-white shadow-sm">
                  <CardContent className="flex items-center gap-3 pt-1">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-tint text-accent">
                      <BriefcaseBusiness className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-0 bg-white shadow-sm sm:col-span-2">
                <CardContent className="pt-1 text-sm text-muted-foreground">
                  This creator has not added portfolio items yet.
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </section>
    </BusinessShell>
  );
}
