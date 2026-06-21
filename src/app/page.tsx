import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "KOLLAB | Local Creative Gigs",
  description:
    "KOLLAB connects Mumbai and Thane creators with local businesses through trusted short-term gigs and escrow.",
};

const valueProps = [
  {
    title: "For Creators",
    description:
      "Find short, local briefs that match your editing, photo, design, writing, or motion skills.",
    icon: Camera,
    tone: "bg-primary-tint text-primary",
  },
  {
    title: "For Businesses",
    description:
      "Post a crisp gig, compare proposals, chat with artists, and approve work without chasing DMs.",
    icon: BriefcaseBusiness,
    tone: "bg-secondary-tint text-secondary",
  },
  {
    title: "How It Works",
    description:
      "Create a profile, match on a gig, hold escrow safely, deliver work, then release payment.",
    icon: Sparkles,
    tone: "bg-accent-tint text-accent",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-foreground">
      <section className="relative flex min-h-[86vh] items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80"
          alt="A welcoming cafe space where local brands can collaborate with creators"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.24em] text-accent">
              KOLLAB
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-[#180B2E] sm:text-6xl">
              Local creative gigs, handled with trust.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#2C2438]">
              KOLLAB connects Mumbai and Thane creators with nearby cafes,
              boutiques, hotels, and local brands for short-term digital work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 bg-primary px-5 text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/register" aria-label="Join KOLLAB as an artist">
                  Join as Artist
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="h-12 bg-secondary px-5 text-secondary-foreground hover:bg-secondary/90"
              >
                <Link href="/register" aria-label="Join KOLLAB as a business">
                  Join as Business
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {valueProps.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="border-0 bg-white shadow-sm">
                <CardContent className="space-y-4 pt-1">
                  <div
                    className={`flex size-12 items-center justify-center rounded-2xl ${item.tone}`}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-accent-tint px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-accent">
              THE SAFETY GUARANTEE
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              Escrow keeps every collaboration calm.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Businesses fund the gig before work starts. KOLLAB holds payment,
              creators submit deliverables in chat, and funds release after
              approval.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Payment held", "Work reviewed", "Ratings unlocked"].map((label) => (
              <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
                <ShieldCheck className="size-6 text-accent" aria-hidden="true" />
                <p className="mt-4 font-semibold">{label}</p>
                <CheckCircle2 className="mt-3 size-5 text-success" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold tracking-[0.16em] text-accent">KOLLAB</p>
          <p>Built for creators and local businesses in Mumbai and Thane.</p>
        </div>
      </footer>
    </main>
  );
}
