import type { Metadata } from "next";
import { BusinessHistoryScreen } from "@/components/kollab/business/BusinessHistoryScreen";

export const metadata: Metadata = {
  title: "Gig History | KOLLAB Business",
  description:
    "Review completed KOLLAB gigs, creator history, ratings, and final paid amounts.",
};

export default function BusinessHistoryPage() {
  return <BusinessHistoryScreen />;
}
