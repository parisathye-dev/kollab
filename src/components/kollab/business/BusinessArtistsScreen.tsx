"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Filter, MapPin, Send, Star } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getBusinessArtistDiscoveryData,
  inviteArtistToGig,
} from "@/lib/supabase/business";
import { skillLabel } from "@/lib/supabase/artist";
import type { ArtistSkill } from "@/types/artist";
import type {
  BusinessArtistDiscoveryData,
  BusinessArtistProfile,
} from "@/types/business";
import type { BusinessArtistFilterInput } from "@/lib/validation/business";

const skillOptions: { value: ArtistSkill | "all"; label: string }[] = [
  { value: "all", label: "All skills" },
  { value: "reel_editor", label: "Reel Editor" },
  { value: "photographer", label: "Photographer" },
  { value: "graphic_designer", label: "Graphic Designer" },
  { value: "ui_ux", label: "UI/UX" },
  { value: "motion_designer", label: "Motion Designer" },
  { value: "copywriter", label: "Copywriter" },
  { value: "videographer", label: "Videographer" },
  { value: "illustrator", label: "Illustrator" },
];

const BusinessArtistMap = dynamic(
  () =>
    import("@/components/kollab/business/BusinessArtistMap").then(
      (module) => module.BusinessArtistMap,
    ),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-2xl bg-white" />,
  },
);

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
  return error instanceof Error ? error.message : "Unable to load artists.";
}

export function BusinessArtistsScreen() {
  const [data, setData] = useState<BusinessArtistDiscoveryData | null>(null);
  const [filters, setFilters] = useState<BusinessArtistFilterInput>({
    skill: "all",
    maxBudget: 25000,
    distanceKm: 25,
    ratingMinimum: 0,
  });
  const [selectedArtist, setSelectedArtist] =
    useState<BusinessArtistProfile | null>(null);
  const [selectedGigId, setSelectedGigId] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    async function loadArtists() {
      try {
        const result = await getBusinessArtistDiscoveryData(filters);
        setData(result);
        setSelectedGigId(result.activeGigs[0]?.id ?? "");
      } catch (error: unknown) {
        toast({
          title: "Artists unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadArtists();
  }, [filters]);

  async function sendInvite() {
    if (!selectedArtist || !selectedGigId) {
      return;
    }

    try {
      setIsInviting(true);
      await inviteArtistToGig({
        artistId: selectedArtist.id,
        gigId: selectedGigId,
      });
      toast({
        title: "Invite sent",
        description: `${selectedArtist.displayName} can now review your brief.`,
      });
      setSelectedArtist(null);
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

  return (
    <BusinessShell title="Artist Discovery">
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Find nearby creators</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Approximate map pins help you discover talent without exposing
              exact addresses.
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                aria-label="Open artist filters"
                variant="outline"
                className="gap-2 bg-white"
              >
                <Filter className="size-4" aria-hidden="true" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Artist Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="artist-skill">Skill</Label>
                  <Select
                    value={filters.skill}
                    onValueChange={(value) =>
                      setFilters((current) => ({
                        ...current,
                        skill: value as ArtistSkill | "all",
                      }))
                    }
                  >
                    <SelectTrigger
                      id="artist-skill"
                      aria-label="Filter by skill"
                      className="h-11 w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-budget">Max Budget</Label>
                  <Input
                    id="max-budget"
                    aria-label="Filter by maximum budget"
                    type="number"
                    min={500}
                    max={25000}
                    value={filters.maxBudget}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        maxBudget: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance</Label>
                  <Input
                    id="distance"
                    aria-label="Filter by distance"
                    type="number"
                    min={1}
                    max={100}
                    value={filters.distanceKm}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        distanceKm: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating minimum</Label>
                  <Input
                    id="rating"
                    aria-label="Filter by minimum rating"
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={filters.ratingMinimum}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        ratingMinimum: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {!data ? (
          <div className="h-72 animate-pulse rounded-2xl bg-white" />
        ) : (
          <>
            <BusinessArtistMap artists={data.artists} />
            <div className="space-y-3">
              {data.artists.length === 0 ? (
                <Card className="border-0 bg-white shadow-sm">
                  <CardContent className="pt-1 text-center">
                    <p className="font-semibold">No creators match these filters.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Loosen distance, budget, or rating to widen the search.
                    </p>
                  </CardContent>
                </Card>
              ) : null}
              {data.artists.map((artist) => (
                <Card key={artist.id} className="border-0 bg-white shadow-sm">
                  <CardContent className="space-y-4 pt-1">
                    <div className="flex items-start gap-4">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-lg font-semibold text-secondary-foreground">
                        {getInitials(artist.displayName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold">
                              {artist.displayName}
                            </h2>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="size-3.5" aria-hidden="true" />
                              {artist.locationText} · {artist.distanceKm.toFixed(1)} km
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-sm font-semibold">
                            <Star
                              className="size-4 fill-warning text-warning"
                              aria-hidden="true"
                            />
                            {artist.avgRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {artist.skills.map((skill) => (
                            <Badge
                              key={skill}
                              className="bg-secondary-tint text-secondary"
                            >
                              {skillLabel(skill)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 rounded-2xl bg-[#FFF8F3] p-3 text-center text-sm">
                      <div>
                        <p className="font-semibold">{artist.totalGigs}</p>
                        <p className="text-xs text-muted-foreground">Gigs</p>
                      </div>
                      <div>
                        <p className="font-semibold">{formatInr(artist.rateMin)}</p>
                        <p className="text-xs text-muted-foreground">From</p>
                      </div>
                      <div>
                        <p className="font-semibold">
                          {artist.isOpenToGigs ? "Open" : "Busy"}
                        </p>
                        <p className="text-xs text-muted-foreground">Status</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        aria-label={`Invite ${artist.displayName} to a gig`}
                        className="flex-1 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        onClick={() => setSelectedArtist(artist)}
                      >
                        <Send className="size-4" aria-hidden="true" />
                        Invite to Gig
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <Link
                          href={`/business/artist/${artist.id}`}
                          aria-label={`View ${artist.displayName} profile`}
                        >
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      <Dialog
        open={Boolean(selectedArtist)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedArtist(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to Gig</DialogTitle>
            <DialogDescription>
              Choose which active brief to share with{" "}
              {selectedArtist?.displayName ?? "this creator"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-gig">Active gig</Label>
              <Select value={selectedGigId} onValueChange={setSelectedGigId}>
                <SelectTrigger
                  id="invite-gig"
                  aria-label="Select gig for invite"
                  className="h-11 w-full"
                >
                  <SelectValue placeholder="Select gig" />
                </SelectTrigger>
                <SelectContent>
                  {(data?.activeGigs ?? []).map((gig) => (
                    <SelectItem key={gig.id} value={gig.id}>
                      {gig.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              aria-label="Send artist invite"
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
