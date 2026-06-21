"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BriefcaseBusiness,
  Home,
  MessageCircle,
  Search,
  User,
  Wallet,
} from "lucide-react";
import { NotificationBell } from "@/components/kollab/shared/NotificationBell";
import { cn } from "@/lib/utils";

type ArtistShellProps = {
  children: ReactNode;
  title?: string;
};

const navItems = [
  { href: "/artist/home", label: "Home", icon: Home },
  { href: "/artist/browse", label: "Browse", icon: Search },
  { href: "/artist/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { href: "/artist/chat", label: "Chat", icon: MessageCircle },
  { href: "/artist/profile", label: "Profile", icon: User },
];

export function ArtistShell({ children, title }: ArtistShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-surface pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link
            href="/artist/home"
            aria-label="Go to artist home"
            className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-base font-semibold text-primary-foreground">
              K
            </span>
            <span className="font-semibold tracking-[0.16em] text-primary">
              KOLLAB
            </span>
          </Link>

          {title ? (
            <p className="hidden text-sm font-medium text-muted-foreground sm:block">
              {title}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Link
              href="/artist/earnings"
              aria-label="Open earnings dashboard"
              className="flex size-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Wallet className="size-4" aria-hidden="true" />
            </Link>
            <NotificationBell tone="artist" />
            <Link
              href="/artist/profile"
              aria-label="Open artist profile"
              className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              A
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-5">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-2 pb-3 pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`Open ${item.label}`}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "bg-primary-tint text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
