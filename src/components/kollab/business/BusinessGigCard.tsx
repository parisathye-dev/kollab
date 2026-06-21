import Link from "next/link";
import { CalendarClock, IndianRupee, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { skillLabel } from "@/lib/supabase/artist";
import { cn } from "@/lib/utils";
import type { BusinessGigPreview } from "@/types/business";

type BusinessGigCardProps = {
  gig: BusinessGigPreview;
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

function daysUntil(deadline: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${deadline}T00:00:00`);

  return Math.max(
    0,
    Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function statusLabel(status: BusinessGigPreview["status"]): string {
  return status.replace("_", " ");
}

export function BusinessGigCard({
  gig,
  compact = false,
  className,
}: BusinessGigCardProps) {
  const remainingDays = daysUntil(gig.deadline);

  return (
    <Link
      href={`/business/gig/${gig.id}`}
      aria-label={`Open gig ${gig.title}`}
      className={cn("block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40", className)}
    >
      <Card className="h-full border-0 bg-white shadow-sm transition-transform hover:-translate-y-0.5">
        <CardContent className="space-y-4 pt-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-secondary-tint text-secondary">
                  {skillLabel(gig.skillRequired)}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {statusLabel(gig.status)}
                </Badge>
              </div>
              <h3
                className={cn(
                  "line-clamp-2 font-semibold leading-snug",
                  compact ? "text-base" : "text-lg",
                )}
              >
                {gig.title}
              </h3>
            </div>
            <span className="shrink-0 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
              {remainingDays}d left
            </span>
          </div>

          {!compact ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {gig.description}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-[#FFF8F3] p-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3.5" aria-hidden="true" />
                Applicants
              </p>
              <p className="mt-1 font-semibold">
                {gig.applicantCount} total · {gig.pendingApplications} pending
              </p>
            </div>
            <div className="rounded-xl bg-accent-tint p-3">
              <p className="flex items-center gap-1 text-xs text-accent">
                <IndianRupee className="size-3.5" aria-hidden="true" />
                Budget
              </p>
              <p className="mt-1 font-semibold">
                {formatInr(gig.budgetMin)} - {formatInr(gig.budgetMax)}
              </p>
            </div>
          </div>

          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" aria-hidden="true" />
            {gig.locationText}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
