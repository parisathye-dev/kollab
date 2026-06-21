import type { Metadata } from "next";
import { SharedChatScreen } from "@/components/kollab/shared/SharedChatScreen";

export const metadata: Metadata = {
  title: "Gig Chat | KOLLAB",
  description:
    "Message the other party, share deliverables, and track escrow-linked collaboration updates.",
};

type SharedChatPageProps = {
  params: {
    gigId: string;
  };
};

export default function SharedChatPage({ params }: SharedChatPageProps) {
  return <SharedChatScreen gigId={params.gigId} />;
}
