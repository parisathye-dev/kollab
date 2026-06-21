import type { Metadata } from "next";
import { ArtistPortfolioScreen } from "@/components/kollab/artist/ArtistPortfolioScreen";

export const metadata: Metadata = {
  title: "Portfolio | KOLLAB Artist",
  description:
    "Manage portfolio uploads and project samples for your KOLLAB artist profile.",
};

export default function ArtistPortfolioPage() {
  return <ArtistPortfolioScreen />;
}
