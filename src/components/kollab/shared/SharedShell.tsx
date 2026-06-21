"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { NotificationBell } from "@/components/kollab/shared/NotificationBell";

type SharedShellProps = {
  children: ReactNode;
  title?: string;
};

export function SharedShell({ children, title }: SharedShellProps) {
  return (
    <main className="min-h-screen bg-accent-tint pb-6 text-foreground">
      <header className="sticky top-0 z-30 border-b border-teal-100 bg-accent-tint/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Go to KOLLAB home"
            className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/40"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-accent text-base font-semibold text-accent-foreground">
              K
            </span>
            <span className="font-semibold tracking-[0.16em] text-accent">
              KOLLAB
            </span>
          </Link>

          {title ? (
            <p className="hidden text-sm font-medium text-muted-foreground sm:block">
              {title}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-accent shadow-sm sm:flex">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Escrow Safe
            </div>
            <NotificationBell tone="shared" />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-5">{children}</div>
    </main>
  );
}
