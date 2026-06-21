import type { Metadata } from "next";
import { BusinessReviewScreen } from "@/components/kollab/business/BusinessReviewScreen";

export const metadata: Metadata = {
  title: "Review Work | KOLLAB Business",
  description:
    "Approve deliverables, request revisions, raise disputes, and release escrow payments.",
};

type BusinessReviewPageProps = {
  params: {
    id: string;
  };
};

export default function BusinessReviewPage({ params }: BusinessReviewPageProps) {
  return <BusinessReviewScreen gigId={params.id} />;
}
