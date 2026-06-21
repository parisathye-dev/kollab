"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getArtistEarningsData } from "@/lib/supabase/artist";
import { cn } from "@/lib/utils";
import type { ArtistEarningsData } from "@/types/artist";
import type { EscrowStatus } from "@/types/database";

type EarningsFilter = "all" | "held" | "released" | "disputed";

const filters: EarningsFilter[] = ["all", "held", "released", "disputed"];

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load earnings.";
}

function getStatusClass(status: EscrowStatus): string {
  const classes: Record<EscrowStatus, string> = {
    held: "bg-primary/15 text-primary-light",
    released: "bg-accent/15 text-accent-light",
    refunded: "bg-white/10 text-white/70",
    disputed: "bg-warning/20 text-warning",
  };

  return classes[status];
}

export function ArtistEarningsScreen() {
  const [data, setData] = useState<ArtistEarningsData | null>(null);
  const [filter, setFilter] = useState<EarningsFilter>("all");

  useEffect(() => {
    async function loadEarnings() {
      try {
        setData(await getArtistEarningsData());
      } catch (error: unknown) {
        toast({
          title: "Earnings unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadEarnings();
  }, []);

  const visibleLedger = useMemo(() => {
    const ledger = data?.ledger ?? [];
    return filter === "all"
      ? ledger
      : ledger.filter((item) => item.status === filter);
  }, [data?.ledger, filter]);

  return (
    <main className="min-h-screen bg-[#06031B] px-4 py-6 text-white">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-light">KOLLAB</p>
            <h1 className="mt-1 text-2xl font-semibold">Earnings</h1>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/20 text-primary-light">
            <Wallet className="size-5" aria-hidden="true" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">This Month</p>
            <p className="mt-3 text-4xl font-semibold">
              {formatInr(data?.thisMonth ?? 0)}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-primary/15 p-5">
            <p className="text-sm text-white/60">Total All Time</p>
            <p className="mt-3 text-4xl font-semibold">
              {formatInr(data?.allTime ?? 0)}
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Escrow ledger</h2>
            <ArrowDownRight className="size-5 text-accent-light" aria-hidden="true" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((item) => (
              <Button
                key={item}
                type="button"
                aria-label={`Filter ${item} escrow`}
                variant={filter === item ? "default" : "outline"}
                className={cn(
                  "shrink-0 capitalize",
                  filter !== item &&
                    "border-white/15 bg-white/5 text-white hover:bg-white/10",
                )}
                onClick={() => setFilter(item)}
              >
                {item}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {visibleLedger.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{item.gigTitle}</h3>
                    <p className="mt-1 text-sm text-white/60">
                      {item.businessName}
                    </p>
                  </div>
                  <Badge className={getStatusClass(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-4 text-xl font-semibold">
                  {formatInr(item.amount)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
