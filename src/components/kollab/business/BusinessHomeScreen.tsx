"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  IndianRupee,
  Plus,
  Send,
  Star,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessGigCard } from "@/components/kollab/business/BusinessGigCard";
import { BusinessShell } from "@/components/kollab/business/BusinessShell";
import { toast } from "@/hooks/use-toast";
import { uploadAvatarFile } from "@/lib/supabase/auth";
import {
  getBusinessDashboardData,
  updateBusinessAvatar,
} from "@/lib/supabase/business";
import type { BusinessDashboardData } from "@/types/business";

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

export function BusinessHomeScreen() {
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [data, setData] = useState<BusinessDashboardData | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await getBusinessDashboardData();
        setData(result);
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

  async function handleLogoUpload(file: File | null) {
    if (!file) {
      return;
    }

    try {
      setIsUploadingLogo(true);
      const avatarUrl = await uploadAvatarFile(file);
      setData(await updateBusinessAvatar(avatarUrl));
      toast({ title: "Business logo updated" });
    } catch (error: unknown) {
      toast({
        title: "Logo upload failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  }

  if (!data) {
    return (
      <BusinessShell title="Business Dashboard">
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded-2xl bg-white" />
          <div className="h-48 animate-pulse rounded-2xl bg-white" />
        </div>
      </BusinessShell>
    );
  }

  return (
    <BusinessShell title="Business Dashboard">
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              aria-label="Upload business logo"
              disabled={isUploadingLogo}
              className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary text-lg font-semibold text-secondary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
              onClick={() => logoInputRef.current?.click()}
            >
              {data.business.avatarUrl ? (
                <img
                  src={data.business.avatarUrl}
                  alt={`${data.business.businessName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                data.business.businessName.slice(0, 1).toUpperCase()
              )}
              <span className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-lg bg-white text-secondary shadow-sm">
                <Camera className="size-3.5" aria-hidden="true" />
              </span>
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              aria-label="Choose business logo"
              onChange={(event) =>
                void handleLogoUpload(event.target.files?.[0] ?? null)
              }
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-secondary">
                {data.business.businessType}
              </p>
              <h1 className="truncate text-2xl font-semibold">
                {data.business.businessName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage briefs, applications, and payments from one place.
              </p>
            </div>
          </div>
          <Link
            href="/business/artists"
            aria-label="Discover artists"
            className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-secondary shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
          >
            Discover
          </Link>
        </div>

        <Card className="border-0 bg-secondary text-secondary-foreground shadow-sm">
          <CardContent className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <p className="text-sm text-white/80">Active Gigs</p>
              <p className="mt-2 text-4xl font-semibold">
                {data.business.liveGigCount}
              </p>
              <p className="text-sm text-white/80">gigs live</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4">
              <p className="text-sm text-white/80">Applications Pending</p>
              <p className="mt-2 text-4xl font-semibold">
                {data.business.pendingApplications}
              </p>
              <p className="text-sm text-white/80">need review</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-2 pt-1">
              <Send className="size-4 text-secondary" aria-hidden="true" />
              <p className="text-lg font-semibold">
                {data.business.totalGigsPosted}
              </p>
              <p className="text-xs text-muted-foreground">Total Gigs Posted</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-2 pt-1">
              <IndianRupee className="size-4 text-accent" aria-hidden="true" />
              <p className="text-lg font-semibold">
                {formatInr(data.business.totalSpent)}
              </p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="space-y-2 pt-1">
              <Star
                className="size-4 fill-warning text-warning"
                aria-hidden="true"
              />
              <p className="text-lg font-semibold">
                {data.business.avgRatingGiven.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Avg Rating Given</p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="size-5 text-secondary" aria-hidden="true" />
              Active Gigs
            </h2>
            <Link
              href="/business/post-gig"
              aria-label="Post a new gig"
              className="text-sm font-medium text-secondary"
            >
              New Gig
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {data.activeGigs.length > 0 ? (
              data.activeGigs.map((gig) => (
                <BusinessGigCard key={gig.id} gig={gig} compact />
              ))
            ) : (
              <Card className="border-0 bg-white shadow-sm md:col-span-2">
                <CardContent className="pt-1 text-sm text-muted-foreground">
                  No active gigs right now. Post a new brief when you are ready.
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </section>

      <Link
        href="/business/post-gig"
        aria-label="Post a new gig"
        className="fixed bottom-24 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg shadow-orange-500/30 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
      >
        <Plus className="size-6" aria-hidden="true" />
      </Link>
    </BusinessShell>
  );
}
