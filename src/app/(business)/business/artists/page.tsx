import type { Metadata } from "next";
import { BusinessArtistsScreen } from "@/components/kollab/business/BusinessArtistsScreen";

export const metadata: Metadata = {
  title: "Artist Discovery | KOLLAB Business",
  description:
    "Discover local creators, filter by skill and rate, and invite artists to business gigs.",
};

export default function BusinessArtistsPage() {
  return <BusinessArtistsScreen />;
}
