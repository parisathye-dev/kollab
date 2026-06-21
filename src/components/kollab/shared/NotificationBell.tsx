"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getNotifications,
  markNotificationsRead,
} from "@/lib/supabase/shared";
import { cn } from "@/lib/utils";
import type { NotificationData, NotificationItem } from "@/types/shared";

type NotificationBellProps = {
  tone?: "artist" | "business" | "shared";
};

function formatNotificationTime(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function toneClasses(tone: NotificationBellProps["tone"]) {
  if (tone === "business") {
    return {
      ring: "focus-visible:ring-secondary/40",
      badge: "bg-secondary text-secondary-foreground",
      text: "text-secondary",
    };
  }

  if (tone === "shared") {
    return {
      ring: "focus-visible:ring-accent/40",
      badge: "bg-accent text-accent-foreground",
      text: "text-accent",
    };
  }

  return {
    ring: "focus-visible:ring-ring/50",
    badge: "bg-primary text-primary-foreground",
    text: "text-primary",
  };
}

function NotificationRow({ item }: { item: NotificationItem }) {
  return (
    <div className="flex gap-3 rounded-xl p-2 hover:bg-muted">
      <span
        className={cn(
          "mt-1 size-2 shrink-0 rounded-full",
          item.isRead ? "bg-muted-foreground/30" : "bg-accent",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5">{item.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatNotificationTime(item.createdAt)} IST
        </p>
      </div>
    </div>
  );
}

export function NotificationBell({ tone = "artist" }: NotificationBellProps) {
  const classes = toneClasses(tone);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationData>({
    unreadCount: 0,
    notifications: [],
  });

  useEffect(() => {
    async function loadNotifications() {
      try {
        const result = await getNotifications();
        setData(result);
      } catch (error: unknown) {
        setData({ unreadCount: 0, notifications: [] });
      }
    }

    void loadNotifications();
  }, []);

  async function toggleOpen() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      setData((current) => ({
        unreadCount: 0,
        notifications: current.notifications.map((item) => ({
          ...item,
          isRead: true,
        })),
      }));

      try {
        await markNotificationsRead();
      } catch (error: unknown) {
        setData((current) => current);
      }
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open notifications"
        aria-expanded={open}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-xl bg-white text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3",
          classes.ring,
        )}
        onClick={toggleOpen}
      >
        <Bell className="size-4" aria-hidden="true" />
        {data.unreadCount > 0 ? (
          <span
            aria-label={`${data.unreadCount} unread notifications`}
            className={cn(
              "absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
              classes.badge,
            )}
          >
            {data.unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <Card className="absolute right-0 top-12 z-50 w-80 border-0 bg-white shadow-xl">
          <CardContent className="pt-1">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">Notifications</p>
              <Badge variant="outline" className={classes.text}>
                All read
              </Badge>
            </div>
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {data.notifications.length > 0 ? (
                data.notifications.map((item) => (
                  <NotificationRow key={item.id} item={item} />
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
