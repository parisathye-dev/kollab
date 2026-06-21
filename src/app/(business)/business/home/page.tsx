import type { Metadata } from "next";
import { BusinessHomeScreen } from "@/components/kollab/business/BusinessHomeScreen";

export const metadata: Metadata = {
  title: "Business Dashboard | KOLLAB",
  description:
    "Manage active gigs, pending applications, spend, and creator collaborations.",
};

export default function BusinessHomePage() {
  return <BusinessHomeScreen />;
}
