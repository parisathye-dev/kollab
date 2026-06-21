"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BriefcaseBusiness,
  History,
  Home,
  PlusCircle,
  Search,
} from "lucide-react";
import { NotificationBell } from "@/components/kollab/shared/NotificationBell";
import { cn } from "@/lib/utils";

type BusinessShellProps = {
  children: ReactNode;
  title?: string;
};

const navItems = [
  { href: "/business/home", label: "Home", icon: Home },
  { href: "/business/post-gig", label: "Post", icon: PlusCircle },
  { href: "/business/artists", label: "Artists", icon: Search },
  { href: "/business/history", label: "History", icon: History },
];

export function BusinessShell({ children, title }: BusinessShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#FFF8F3] pb-24 text-foreground">
      <header className="sticky top-0 z-30 border-b border-orange-100 bg-[#FFF8F3]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link
            href="/business/home"
            aria-label="Go to business home"
            className="flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-base font-semibold text-secondary-foreground">
              K
            </span>
            <span className="font-semibold tracking-[0.16em] text-secondary">
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
              href="/business/post-gig"
              aria-label="Post a new gig"
              className="hidden items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40 sm:flex"
            >
              <BriefcaseBusiness className="size-4" aria-hidden="true" />
              Post Gig
            </Link>
            <NotificationBell tone="business" />
            <Link
              href="/business/home"
              aria-label="Open business profile"
              className="flex size-9 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40"
            >
              B
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-5">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-2 pb-3 pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/business/home" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`Open ${item.label}`}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-secondary/40",
                  active
                    ? "bg-secondary-tint text-secondary"
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
