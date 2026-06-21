"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IndianRupee, Star, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GigCard } from "@/components/kollab/GigCard";
import { ArtistShell } from "@/components/kollab/artist/ArtistShell";
import { toast } from "@/hooks/use-toast";
import {
  getArtistDashboardData,
  setArtistOpenToGigs,
} from "@/lib/supabase/artist";
import { cn } from "@/lib/utils";
import type { ArtistDashboardData } from "@/types/artist";

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load dashboard.";
}

export function ArtistHomeScreen() {
  const [data, setData] = useState<ArtistDashboardData | null>(null);
  const [isOpenToGigs, setIsOpenToGigs] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await getArtistDashboardData();
        setData(result);
        setIsOpenToGigs(result.artist.isOpenToGigs);
      } catch (error: unknown) {
        toast({
          title: "Dashboard unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadDashboard();
  }, []);

  async function toggleAvailability() {
    try {
      const nextValue = !isOpenToGigs;
      setIsOpenToGigs(nextValue);
      await setArtistOpenToGigs(nextValue);
    } catch (error: unknown) {
      setIsOpenToGigs((value) => !value);
      toast({
        title: "Availability not saved",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  }

  if (!data) {
    return (
      <ArtistShell title="Dashboard">
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-2xl bg-white" />
          <div className="h-36 animate-pulse rounded-2xl bg-white" />
        </div>
      </ArtistShell>
    );
  }

  return (
    <ArtistShell title="Dashboard">
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Hey {data.artist.displayName} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Fresh local briefs are waiting around Mumbai and Thane.
            </p>
          </div>
          <button
            type="button"
            aria-label="Toggle open to gigs"
            aria-pressed={isOpenToGigs}
            onClick={toggleAvailability}
            className={cn(
              "mt-1 flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-medium shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isOpenToGigs
                ? "bg-success text-white"
                : "bg-white text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                isOpenToGigs ? "bg-white" : "bg-muted-foreground",
              )}
            />
            Open to Gigs
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-2 pt-1">
              <Trophy className="size-4 text-primary" aria-hidden="true" />
              <p className="text-lg font-semibold">{data.artist.totalGigs}</p>
              <p className="text-xs text-muted-foreground">Total Gigs Done</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-2 pt-1">
              <Star className="size-4 fill-warning text-warning" aria-hidden="true" />
              <p className="text-lg font-semibold">
                {data.artist.avgRating.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Rating ⭐</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-2 pt-1">
              <IndianRupee className="size-4 text-accent" aria-hidden="true" />
              <p className="text-lg font-semibold">
                {formatInr(data.artist.thisMonthEarnings)}
              </p>
              <p className="text-xs text-muted-foreground">This Month Earnings</p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Gigs Near You</h2>
            <Link
              href="/artist/browse"
              aria-label="Browse all gigs"
              className="text-sm font-medium text-primary"
            >
              Browse
            </Link>
          </div>
          {data.gigsNearYou.length > 0 ? (
            <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
              {data.gigsNearYou.map((gig) => (
                <GigCard
                  key={gig.id}
                  gig={gig}
                  compact
                  className="snap-start"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-5 text-sm text-muted-foreground shadow-sm">
              No live gigs nearby right now.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <div className="space-y-3">
            {data.recentApplications.length > 0 ? (
              data.recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`/artist/gig/${application.gigId}`}
                  aria-label={`Open application for ${application.title}`}
                  className="block rounded-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Card className="border-0 bg-white shadow-sm">
                    <CardContent className="flex items-center justify-between gap-3 pt-1">
                      <div className="min-w-0">
                        <h3 className="truncate font-medium">{application.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {application.businessName} ·{" "}
                          {formatInr(application.quotedRate)}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          application.status === "accepted" &&
                            "bg-accent-tint text-accent",
                          application.status === "pending" &&
                            "bg-primary-tint text-primary",
                        )}
                      >
                        {application.status}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl bg-white p-5 text-sm text-muted-foreground shadow-sm">
                Applications you send will appear here.
              </div>
            )}
          </div>
        </section>
      </section>
    </ArtistShell>
  );
}
