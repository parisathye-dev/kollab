import type { Metadata } from "next";
import { ArtistChatScreen } from "@/components/kollab/artist/ArtistChatScreen";

export const metadata: Metadata = {
  title: "Artist Chat | KOLLAB",
  description:
    "Open KOLLAB conversations connected to accepted artist collaborations.",
};

export default function ArtistChatPage() {
  return <ArtistChatScreen />;
}
