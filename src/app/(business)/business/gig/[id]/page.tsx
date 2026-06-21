import type { Metadata } from "next";
import { BusinessGigDetailScreen } from "@/components/kollab/business/BusinessGigDetailScreen";

export const metadata: Metadata = {
  title: "Business Gig Detail | KOLLAB",
  description:
    "Review business gig details, proposals, escrow status, and collaboration progress.",
};

type BusinessGigDetailPageProps = {
  params: {
    id: string;
  };
};

export default function BusinessGigDetailPage({
  params,
}: BusinessGigDetailPageProps) {
  return <BusinessGigDetailScreen gigId={params.id} />;
}
