import type { Metadata } from "next";
import { BusinessArtistProfileScreen } from "@/components/kollab/business/BusinessArtistProfileScreen";

export const metadata: Metadata = {
  title: "Creator Profile | KOLLAB Business",
  description:
    "View a KOLLAB creator profile, skills, portfolio, rating, and rates as a business.",
};

type BusinessArtistProfilePageProps = {
  params: {
    id: string;
  };
};

export default function BusinessArtistProfilePage({
  params,
}: BusinessArtistProfilePageProps) {
  return <BusinessArtistProfileScreen artistId={params.id} />;
}
