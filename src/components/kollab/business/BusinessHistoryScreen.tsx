"use client";

import { useEffect, useState } from "react";
import { CalendarDays, IndianRupee, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessShell } from "@/components/kollab/business/BusinessShell";
import { toast } from "@/hooks/use-toast";
import { getBusinessHistoryData } from "@/lib/supabase/business";
import { skillLabel } from "@/lib/supabase/artist";
import type {
  BusinessHistoryData,
  BusinessHistoryItem,
  BusinessSortKey,
} from "@/types/business";

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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
  return error instanceof Error ? error.message : "Unable to load history.";
}

function HistoryCard({ item }: { item: BusinessHistoryItem }) {
  return (
    <Card className="border-0 bg-white shadow-sm">
      <CardContent className="space-y-4 pt-1">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-secondary-foreground">
            {getInitials(item.artistName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="line-clamp-2 font-semibold">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.artistName}</p>
              </div>
              <Badge className="bg-accent-tint text-accent">
                {skillLabel(item.skillRequired)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-[#FFF8F3] p-3 text-center text-sm">
          <div>
            <p className="flex items-center justify-center gap-1 font-semibold">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDate(item.completedAt)}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-1 font-semibold">
              <IndianRupee className="size-3.5" aria-hidden="true" />
              {formatInr(item.finalAmount)}
            </p>
            <p className="text-xs text-muted-foreground">Final Amount</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-1 font-semibold">
              {item.ratingGiven}
              <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
            </p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BusinessHistoryScreen() {
  const [sortKey, setSortKey] = useState<BusinessSortKey>("date");
  const [data, setData] = useState<BusinessHistoryData | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const result = await getBusinessHistoryData(sortKey);
        setData(result);
      } catch (error: unknown) {
        toast({
          title: "History unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadHistory();
  }, [sortKey]);

  return (
    <BusinessShell title="Gig History">
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Gig History</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Completed collaborations, spend, and ratings.
            </p>
          </div>
          <Select
            value={sortKey}
            onValueChange={(value) => setSortKey(value as BusinessSortKey)}
          >
            <SelectTrigger
              aria-label="Sort gig history"
              className="h-10 w-32 bg-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!data ? (
          <div className="space-y-3">
            <div className="h-36 animate-pulse rounded-2xl bg-white" />
            <div className="h-36 animate-pulse rounded-2xl bg-white" />
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </BusinessShell>
  );
}
