import Link from "next/link";
import { CalendarDays, MapPin, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { skillLabel } from "@/lib/supabase/artist";
import { cn } from "@/lib/utils";
import type { GigPreview } from "@/types/artist";

type GigCardProps = {
  gig: GigPreview;
  href?: string;
  compact?: boolean;
  className?: string;
};

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function formatDeadline(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function GigCard({
  gig,
  href = `/artist/gig/${gig.id}`,
  compact = false,
  className,
}: GigCardProps) {
  return (
    <Link
      href={href}
      aria-label={`Open gig ${gig.title}`}
      className={cn("block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}
    >
      <Card
        className={cn(
          "h-full border-0 bg-white shadow-sm transition-transform hover:-translate-y-0.5",
          compact ? "min-w-72" : "w-full",
        )}
      >
        <CardContent className="space-y-4 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {gig.businessName}
              </p>
              <h3 className="line-clamp-2 text-base font-semibold leading-snug">
                {gig.title}
              </h3>
            </div>
            <Badge className="bg-primary-tint text-primary">
              {skillLabel(gig.skillRequired)}
            </Badge>
          </div>

          {gig.matchesSkills ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-2.5 py-1 text-xs font-medium text-accent">
              <Target className="size-3" aria-hidden="true" />
              Matches your skills 🎯
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-semibold">
                {formatInr(gig.budgetMin)} - {formatInr(gig.budgetMax)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Deadline</p>
              <p className="flex items-center gap-1 font-semibold">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {formatDeadline(gig.deadline)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{gig.locationText}</span>
            </span>
            <span className="shrink-0">{gig.distanceKm.toFixed(1)} km</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
