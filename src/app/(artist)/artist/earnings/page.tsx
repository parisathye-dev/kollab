import type { Metadata } from "next";
import { ArtistEarningsScreen } from "@/components/kollab/artist/ArtistEarningsScreen";

export const metadata: Metadata = {
  title: "Earnings | KOLLAB Artist",
  description:
    "Track monthly earnings, lifetime payouts, and escrow ledger status as a KOLLAB artist.",
};

export default function ArtistEarningsPage() {
  return <ArtistEarningsScreen />;
}
