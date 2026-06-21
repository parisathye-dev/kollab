import type { ReactNode } from "react";
import Link from "next/link";

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow = "KOLLAB",
  title,
  subtitle,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-surface px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-3 self-start"
          aria-label="Go to KOLLAB home"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
            K
          </span>
          <span className="text-lg font-semibold tracking-[0.18em] text-primary">
            {eyebrow}
          </span>
        </Link>

        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>

        {children}
      </section>
    </main>
  );
}
