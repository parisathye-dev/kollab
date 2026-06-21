import type { Metadata } from "next";
import { SharedTrackerScreen } from "@/components/kollab/shared/SharedTrackerScreen";

export const metadata: Metadata = {
  title: "Gig Progress Tracker | KOLLAB",
  description:
    "Track KOLLAB gig milestones, escrow safety, deadline countdowns, and rating status.",
};

type SharedTrackerPageProps = {
  params: {
    gigId: string;
  };
};

export default function SharedTrackerPage({ params }: SharedTrackerPageProps) {
  return <SharedTrackerScreen gigId={params.gigId} />;
}
