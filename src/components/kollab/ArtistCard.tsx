import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { skillLabel } from "@/lib/supabase/artist";
import type { ArtistSummary } from "@/types/artist";

type ArtistCardProps = {
  artist: ArtistSummary;
  compact?: boolean;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function ArtistCard({ artist, compact = false }: ArtistCardProps) {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="pt-1">
        <div className="flex items-start gap-4">
          {artist.avatarUrl ? (
            <img
              src={artist.avatarUrl}
              alt={`${artist.displayName} profile photo`}
              className="size-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
              {getInitials(artist.displayName)}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h2 className="text-xl font-semibold">{artist.displayName}</h2>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden="true" />
                {artist.locationText}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {artist.skills.slice(0, compact ? 3 : artist.skills.length).map((skill) => (
                <Badge key={skill} className="bg-primary-tint text-primary">
                  {skillLabel(skill)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {!compact ? (
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-surface p-3 text-center">
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
        ) : null}
      </CardContent>
    </Card>
  );
}
