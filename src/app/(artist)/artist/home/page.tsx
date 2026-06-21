import type { Metadata } from "next";
import { ArtistHomeScreen } from "@/components/kollab/artist/ArtistHomeScreen";

export const metadata: Metadata = {
  title: "Artist Dashboard | KOLLAB",
  description:
    "View nearby gigs, applications, ratings, and earnings from the KOLLAB artist dashboard.",
};

export default function ArtistHomePage() {
  return <ArtistHomeScreen />;
}
