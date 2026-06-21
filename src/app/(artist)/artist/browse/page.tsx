import type { Metadata } from "next";
import { ArtistBrowseScreen } from "@/components/kollab/artist/ArtistBrowseScreen";

export const metadata: Metadata = {
  title: "Browse Gigs | KOLLAB",
  description:
    "Search and filter local creative gigs matched to your KOLLAB artist profile.",
};

export default function ArtistBrowsePage() {
  return <ArtistBrowseScreen />;
}
