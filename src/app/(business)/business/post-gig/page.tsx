import type { Metadata } from "next";
import { BusinessPostGigScreen } from "@/components/kollab/business/BusinessPostGigScreen";

export const metadata: Metadata = {
  title: "Post a Gig | KOLLAB Business",
  description:
    "Create a KOLLAB business gig with skill, budget, deadline, location, and references.",
};

export default function BusinessPostGigPage() {
  return <BusinessPostGigScreen />;
}
