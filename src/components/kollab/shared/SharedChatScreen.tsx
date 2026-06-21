"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FileUp, Paperclip, Send, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SharedShell } from "@/components/kollab/shared/SharedShell";
import { toast } from "@/hooks/use-toast";
import {
  getSharedChatData,
  markGigMessagesRead,
  mergeMessage,
  sendSharedMessage,
  subscribeToGigMessages,
} from "@/lib/supabase/shared";
import { cn } from "@/lib/utils";
import type { SharedChatData, SharedMessage } from "@/types/shared";

type SharedChatScreenProps = {
  gigId: string;
};

function formatIstTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load chat.";
}

function MessageBubble({ message }: { message: SharedMessage }) {
  return (
    <div className={cn("flex", message.isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 shadow-sm",
          message.isOwn
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-white text-foreground",
        )}
      >
        {!message.isOwn ? (
          <p className="mb-1 text-xs font-semibold text-muted-foreground">
            {message.senderName}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        {message.attachment ? (
          <a
            href={message.attachment.url}
            aria-label={`Open attachment ${message.attachment.name}`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
              message.isOwn
                ? "bg-white/15 text-primary-foreground"
                : "bg-accent-tint text-accent",
            )}
          >
            <FileUp className="size-4" aria-hidden="true" />
            <span className="truncate">{message.attachment.name}</span>
          </a>
        ) : null}
        <p
          className={cn(
            "mt-2 text-right text-[11px]",
            message.isOwn ? "text-white/75" : "text-muted-foreground",
          )}
        >
          {formatIstTime(message.createdAt)} IST
        </p>
      </div>
    </div>
  );
}

export function SharedChatScreen({ gigId }: SharedChatScreenProps) {
  const [data, setData] = useState<SharedChatData | null>(null);
  const [messages, setMessages] = useState<SharedMessage[]>([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadChat() {
      try {
        const result = await getSharedChatData(gigId);
        setData(result);
        setMessages(result.messages);
        await markGigMessagesRead(gigId);
      } catch (error: unknown) {
        toast({
          title: "Chat unavailable",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }

    void loadChat();
    const unsubscribe = subscribeToGigMessages(gigId, () => {
      void loadChat();
    });

    return unsubscribe;
  }, [gigId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!content.trim() && !file) {
      return;
    }

    try {
      setSending(true);
      const nextMessage = await sendSharedMessage(gigId, content, file ?? undefined);
      setMessages((current) => mergeMessage(current, nextMessage));
      setContent("");
      setFile(null);
    } catch (error: unknown) {
      toast({
        title: "Message not sent",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  if (!data) {
    return (
      <SharedShell title="Chat">
        <div className="h-[72vh] animate-pulse rounded-3xl bg-white" />
      </SharedShell>
    );
  }

  return (
    <SharedShell title="Chat">
      <section className="mx-auto flex h-[calc(100vh-120px)] max-w-3xl flex-col overflow-hidden rounded-3xl bg-[#F4FBFA] shadow-sm">
        <header className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-accent-foreground">
              {getInitials(data.otherParty.name)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-semibold">{data.gigTitle}</h1>
              <p className="truncate text-sm text-muted-foreground">
                {data.otherParty.name}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge className="bg-accent-tint text-accent">
              <ShieldCheck className="mr-1 size-3" aria-hidden="true" />
              {data.escrowStatus}
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/shared/tracker/${gigId}`}
                aria-label="Open gig tracker"
              >
                Tracker
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>

        {file ? (
          <div className="border-t bg-white px-4 py-2 text-sm text-muted-foreground">
            Attached: <span className="font-medium text-foreground">{file.name}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2 border-t bg-white p-3">
          <label
            htmlFor="chat-attachment"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-accent-tint text-accent focus-within:ring-3 focus-within:ring-accent/40"
          >
            <Paperclip className="size-5" aria-hidden="true" />
            <input
              id="chat-attachment"
              type="file"
              aria-label="Attach deliverable file"
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <Input
            aria-label="Type chat message"
            placeholder="Message"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
          />
          <Button
            type="button"
            aria-label="Send message"
            disabled={sending || (!content.trim() && !file)}
            className="size-10 shrink-0 bg-accent p-0 text-accent-foreground hover:bg-accent/90"
            onClick={sendMessage}
          >
            <Send className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </section>
    </SharedShell>
  );
}
