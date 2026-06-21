import type { Metadata } from "next";
import { ArtistGigDetailScreen } from "@/components/kollab/artist/ArtistGigDetailScreen";

export const metadata: Metadata = {
  title: "Gig Detail | KOLLAB Artist",
  description:
    "Review gig details, map context, budget, and application status as a KOLLAB artist.",
};

type ArtistGigPageProps = {
  params: {
    id: string;
  };
};

export default function ArtistGigPage({ params }: ArtistGigPageProps) {
  return <ArtistGigDetailScreen gigId={params.id} />;
}
