"use client";

import { MessageCircle } from "lucide-react";
import { ArtistShell } from "@/components/kollab/artist/ArtistShell";

export function ArtistChatScreen() {
  return (
    <ArtistShell title="Chat">
      <section className="flex min-h-[55vh] items-center justify-center rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="space-y-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-tint text-primary">
            <MessageCircle className="size-7" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold">Chat</h1>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Conversations with businesses will appear here after an application is accepted.
          </p>
        </div>
      </section>
    </ArtistShell>
  );
}
