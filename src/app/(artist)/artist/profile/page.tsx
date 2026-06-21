import type { Metadata } from "next";
import { ArtistProfileScreen } from "@/components/kollab/artist/ArtistProfileScreen";

export const metadata: Metadata = {
  title: "Artist Profile | KOLLAB",
  description:
    "View and edit your public KOLLAB artist profile, skills, rates, and portfolio.",
};

export default function ArtistProfilePage() {
  return <ArtistProfileScreen />;
}
