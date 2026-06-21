"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GigCard } from "@/components/kollab/GigCard";
import { ArtistShell } from "@/components/kollab/artist/ArtistShell";
import { toast } from "@/hooks/use-toast";
import { getArtistBrowseData, skillLabel } from "@/lib/supabase/artist";
import type { BrowseFilterInput } from "@/lib/validation/artist";
import type { ArtistBrowseData, ArtistSkill, GigPreview } from "@/types/artist";

const skillOptions: Array<ArtistSkill | "all"> = [
  "all",
  "reel_editor",
  "photographer",
  "graphic_designer",
  "ui_ux",
  "motion_designer",
  "copywriter",
  "videographer",
  "illustrator",
];

const defaultFilters: BrowseFilterInput = {
  skill: "all",
  budgetMin: 0,
  budgetMax: 100000,
  distanceKm: 25,
  workType: "all",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load gigs.";
}

function filterGigs(
  gigs: GigPreview[],
  query: string,
  filters: BrowseFilterInput,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return gigs.filter((gig) => {
    const matchesQuery =
      !normalizedQuery ||
      gig.title.toLowerCase().includes(normalizedQuery) ||
      gig.businessName.toLowerCase().includes(normalizedQuery);
    const matchesSkill =
      filters.skill === "all" || gig.skillRequired === filters.skill;
    const matchesBudget =
      gig.budgetMax >= filters.budgetMin && gig.budgetMin <= filters.budgetMax;
    const matchesDistance = gig.distanceKm <= filters.distanceKm;
    const matchesWorkType =
      filters.workType === "all" ||
      gig.workType === filters.workType ||
      gig.workType === "either";

    return (
      matchesQuery &&
      matchesSkill &&
      matchesBudget &&
      matchesDistance &&
      matchesWorkType
    );
  });
}

export function ArtistBrowseScreen() {
  const [data, setData] = useState<ArtistBrowseData | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<BrowseFilterInput>(defaultFilters);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);

  async function loadGigs() {
    try {
      setIsRefreshing(true);
      setData(await getArtistBrowseData());
    } catch (error: unknown) {
      toast({
        title: "Gig feed unavailable",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadGigs();
  }, []);

  const visibleGigs = useMemo(
    () => filterGigs(data?.gigs ?? [], query, filters),
    [data?.gigs, query, filters],
  );

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartY.current === null || window.scrollY > 0) {
      touchStartY.current = null;
      return;
    }

    const delta = event.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;

    if (delta > 60) {
      void loadGigs();
    }
  }

  return (
    <ArtistShell title="Browse">
      <section
        className="space-y-4"
        onTouchStart={(event) => {
          touchStartY.current = event.touches[0].clientY;
        }}
        onTouchEnd={handleTouchEnd}
      >
        <div>
          <h1 className="text-2xl font-semibold">Gig Discovery</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fresh briefs matched to your craft, distance, and budget.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search gigs or businesses"
              className="h-11 pl-9"
              aria-label="Search gigs"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                aria-label="Open gig filters"
              >
                <Filter className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow gigs by skill, budget, distance, and work type.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-4">
                <div className="space-y-2">
                  <Label>Skill</Label>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        aria-label={`Filter by ${skill}`}
                        aria-pressed={filters.skill === skill}
                        onClick={() =>
                          setFilters((value) => ({ ...value, skill }))
                        }
                        className={
                          filters.skill === skill
                            ? "rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                            : "rounded-full bg-muted px-3 py-2 text-sm font-medium"
                        }
                      >
                        {skill === "all" ? "All" : skillLabel(skill)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Min budget</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={filters.budgetMin}
                      aria-label="Minimum budget"
                      onChange={(event) =>
                        setFilters((value) => ({
                          ...value,
                          budgetMin: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Max budget</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={filters.budgetMax}
                      aria-label="Maximum budget"
                      onChange={(event) =>
                        setFilters((value) => ({
                          ...value,
                          budgetMax: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distanceKm">
                    Distance: {filters.distanceKm} km
                  </Label>
                  <Input
                    id="distanceKm"
                    type="range"
                    min={1}
                    max={50}
                    value={filters.distanceKm}
                    aria-label="Maximum distance"
                    onChange={(event) =>
                      setFilters((value) => ({
                        ...value,
                        distanceKm: Number(event.target.value),
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {(["all", "in_person", "remote", "either"] as const).map(
                    (workType) => (
                      <button
                        key={workType}
                        type="button"
                        aria-label={`Filter ${workType} gigs`}
                        aria-pressed={filters.workType === workType}
                        onClick={() =>
                          setFilters((value) => ({ ...value, workType }))
                        }
                        className={
                          filters.workType === workType
                            ? "rounded-xl bg-primary px-2 py-2 text-xs font-medium text-primary-foreground"
                            : "rounded-xl bg-muted px-2 py-2 text-xs font-medium"
                        }
                      >
                        {workType.replace("_", " ")}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            aria-label="Refresh gig feed"
            onClick={() => void loadGigs()}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={isRefreshing ? "size-4 animate-spin" : "size-4"}
              aria-hidden="true"
            />
          </Button>
        </div>

        <div className="space-y-3">
          {visibleGigs.length > 0 ? (
            visibleGigs.map((gig) => <GigCard key={gig.id} gig={gig} />)
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-muted-foreground shadow-sm">
              No gigs found nearby — check back soon!
            </div>
          )}
        </div>
      </section>
    </ArtistShell>
  );
}
