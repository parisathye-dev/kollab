"use client";

import { createClient } from "@/lib/supabase/client";
import {
  chatMessageSchema,
  deliverableFileSchema,
  ratingSchema,
  submitWorkSchema,
  type RatingInput,
} from "@/lib/validation/shared";
import type {
  Application,
  Escrow,
  Gig,
  Message,
  Notification,
  Profile,
  ProfileRole,
  Rating,
} from "@/types/database";
import type {
  NotificationData,
  NotificationItem,
  RatingState,
  SharedChatData,
  SharedMessage,
  SharedParty,
  SharedTrackerData,
  TrackerStep,
} from "@/types/shared";

const demoGigId = "1516a61f-5f80-4716-93b8-c026a08695c9";
const demoReviewGigId = "d4801f93-232c-46b1-965c-e5ad68e3c645";

const demoArtist: SharedParty = {
  id: "6fc81fd7-89f2-49be-9efb-90d73a85881d",
  name: "Aarav Mehta",
  avatarUrl: null,
  role: "artist",
};

const demoBusiness: SharedParty = {
  id: "491f9ffd-4413-4af5-b9a5-b8bf0c598799",
  name: "Chai & Chatter Cafe",
  avatarUrl: null,
  role: "business",
};

const demoMessages: SharedMessage[] = [
  {
    id: "message-1",
    gigId: demoGigId,
    senderId: demoBusiness.id,
    senderName: demoBusiness.name,
    content: "Loved your pitch. Can you shoot tomorrow morning before 11?",
    attachment: null,
    isOwn: false,
    isRead: true,
    createdAt: "2026-06-21T04:30:00.000Z",
  },
  {
    id: "message-2",
    gigId: demoGigId,
    senderId: demoArtist.id,
    senderName: demoArtist.name,
    content: "Yes, I can bring a compact light and deliver the first cut by evening.",
    attachment: null,
    isOwn: true,
    isRead: true,
    createdAt: "2026-06-21T04:42:00.000Z",
  },
  {
    id: "message-3",
    gigId: demoGigId,
    senderId: demoArtist.id,
    senderName: demoArtist.name,
    content: "Sharing the rough cut here for review.",
    attachment: {
      url: "demo://rough-cut",
      type: "video/mp4",
      name: "rough-cut.mp4",
    },
    isOwn: true,
    isRead: false,
    createdAt: "2026-06-21T08:12:00.000Z",
  },
];

const demoNotifications: NotificationItem[] = [
  {
    id: "notification-1",
    type: "NEW_APPLICATION",
    message: "Aryan applied to your Food Reel gig",
    isRead: false,
    createdAt: "2026-06-21T06:30:00.000Z",
  },
  {
    id: "notification-2",
    type: "APPLICATION_ACCEPTED",
    message: "Your application was accepted! 🎉",
    isRead: false,
    createdAt: "2026-06-21T05:10:00.000Z",
  },
  {
    id: "notification-3",
    type: "WORK_SUBMITTED",
    message: "Artist has submitted their work for review",
    isRead: true,
    createdAt: "2026-06-20T15:45:00.000Z",
  },
  {
    id: "notification-4",
    type: "PAYMENT_RELEASED",
    message: "₹2,250 has been released to your account",
    isRead: true,
    createdAt: "2026-06-19T15:45:00.000Z",
  },
  {
    id: "notification-5",
    type: "NEW_MESSAGE",
    message: "New message from Chai & Chatter Cafe",
    isRead: true,
    createdAt: "2026-06-18T15:45:00.000Z",
  },
];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return Boolean(
    url &&
      key &&
      url.startsWith("http") &&
      url !== "your-supabase-url" &&
      key !== "your-anon-key",
  );
}

function getErrorMessage(_error: unknown, fallback: string): string {
  return fallback;
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function formatAttachment(message: Message, resolvedUrl?: string | null) {
  if (!message.attachment_url) {
    return null;
  }

  return {
    url: resolvedUrl ?? message.attachment_url,
    type: message.attachment_type ?? "application/octet-stream",
    name: message.attachment_name ?? "Attachment",
  };
}

function toParty(profile: Profile): SharedParty {
  return {
    id: profile.id,
    name: profile.display_name,
    avatarUrl: profile.avatar_url,
    role: profile.role,
  };
}

function toNotificationItem(notification: Notification): NotificationItem {
  return {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    isRead: notification.is_read,
    createdAt: notification.created_at,
  };
}

async function resolveDeliverableUrl(pathOrUrl: string): Promise<string> {
  try {
    if (pathOrUrl.startsWith("http") || pathOrUrl.startsWith("demo://")) {
      return pathOrUrl;
    }

    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("gig-deliverables")
      .createSignedUrl(pathOrUrl, 60 * 60);

    if (error) {
      throw error;
    }

    if (!data?.signedUrl) {
      throw new Error("Deliverable URL could not be signed.");
    }

    return data.signedUrl;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to open deliverable file."));
  }
}

async function toSharedMessageFromDatabase(
  message: Message,
  currentUser: SharedParty,
  otherParty: SharedParty,
): Promise<SharedMessage> {
  const isOwn = message.sender_id === currentUser.id;
  const attachmentUrl = message.attachment_url
    ? await resolveDeliverableUrl(message.attachment_url)
    : null;

  return {
    id: message.id,
    gigId: message.gig_id,
    senderId: message.sender_id,
    senderName: isOwn ? currentUser.name : otherParty.name,
    content: message.content,
    attachment: formatAttachment(message, attachmentUrl),
    isOwn,
    isRead: message.is_read,
    createdAt: message.created_at,
  };
}

function demoRoleForGig(gigId: string): ProfileRole {
  return gigId === demoReviewGigId ? "business" : "artist";
}

function demoCurrentUser(gigId: string): SharedParty {
  return demoRoleForGig(gigId) === "business" ? demoBusiness : demoArtist;
}

function demoOtherParty(gigId: string): SharedParty {
  return demoRoleForGig(gigId) === "business" ? demoArtist : demoBusiness;
}

function demoGigStatus(gigId: string) {
  if (gigId === demoReviewGigId) {
    return "under_review" as const;
  }

  if (gigId.endsWith("released")) {
    return "completed" as const;
  }

  return "in_progress" as const;
}

function getTrackerSteps(
  status: SharedTrackerData["gig"]["status"],
  escrowStatus: SharedTrackerData["escrow"]["status"],
  applicationAccepted: boolean,
): TrackerStep[] {
  const inProgress = status === "in_progress";
  const underReview = status === "under_review";
  const completed = status === "completed" || escrowStatus === "released";

  return [
    { key: "posted", label: "Gig Posted", state: "done", tone: "green" },
    {
      key: "hired",
      label: "Artist Hired",
      state: applicationAccepted ? "done" : "waiting",
      tone: applicationAccepted ? "green" : "muted",
    },
    {
      key: "in_progress",
      label: "Work In Progress",
      state: inProgress ? "active" : underReview || completed ? "done" : "waiting",
      tone: inProgress ? "orange" : underReview || completed ? "green" : "muted",
    },
    {
      key: "under_review",
      label: "Under Review",
      state: underReview ? "active" : completed ? "done" : "waiting",
      tone: underReview ? "yellow" : completed ? "green" : "muted",
    },
    {
      key: "completed",
      label: "Completed & Paid",
      state: completed ? "done" : "waiting",
      tone: completed ? "green" : "muted",
    },
  ];
}

function demoRatingState(gigId: string): RatingState {
  if (gigId.endsWith("released")) {
    return {
      escrowReleased: true,
      ownSubmitted: false,
      otherSubmitted: false,
      visibleRatings: [],
    };
  }

  return {
    escrowReleased: false,
    ownSubmitted: false,
    otherSubmitted: false,
    visibleRatings: [],
  };
}

async function getCurrentProfile(): Promise<SharedParty> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error("You need to be signed in.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      throw new Error("Profile not found.");
    }

    return toParty(profile);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load current profile."));
  }
}

async function getGigContext(
  gigId: string,
  currentUser: SharedParty,
): Promise<{
  gig: Gig;
  application: Application | null;
  escrow: Escrow | null;
  otherParty: SharedParty;
}> {
  try {
    const supabase = createClient();
    const { data: gig, error: gigError } = await supabase
      .from("gigs")
      .select("*")
      .eq("id", gigId)
      .single();

    if (gigError) {
      throw gigError;
    }

    if (!gig) {
      throw new Error("Gig not found.");
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select("*")
      .eq("gig_id", gigId)
      .eq("status", "accepted")
      .maybeSingle();

    if (applicationError) {
      throw applicationError;
    }

    const { data: escrow, error: escrowError } = await supabase
      .from("escrow")
      .select("*")
      .eq("gig_id", gigId)
      .maybeSingle();

    if (escrowError) {
      throw escrowError;
    }

    const otherPartyId =
      currentUser.role === "artist" ? gig.business_id : application?.artist_id;

    if (!otherPartyId) {
      throw new Error("Other party is not available yet.");
    }

    const { data: otherProfile, error: otherProfileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", otherPartyId)
      .single();

    if (otherProfileError) {
      throw otherProfileError;
    }

    if (!otherProfile) {
      throw new Error("Other profile not found.");
    }

    return {
      gig,
      application,
      escrow,
      otherParty: toParty(otherProfile),
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load gig context."));
  }
}

async function getRatingState(
  gigId: string,
  currentUser: SharedParty,
  otherParty: SharedParty,
  escrowStatus: Escrow["status"],
): Promise<RatingState> {
  try {
    if (!isSupabaseConfigured()) {
      return demoRatingState(gigId);
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("gig_id", gigId);

    if (error) {
      throw error;
    }

    const ratings = data ?? [];
    const ownRating = ratings.find((rating) => rating.rater_id === currentUser.id);
    const otherRating = ratings.find((rating) => rating.rater_id === otherParty.id);

    return {
      escrowReleased: escrowStatus === "released",
      ownSubmitted: Boolean(ownRating),
      otherSubmitted: Boolean(otherRating),
      visibleRatings: ratings
        .filter((rating) => rating.visible)
        .map((rating) => ({
          id: rating.id,
          raterName:
            rating.rater_id === currentUser.id ? currentUser.name : otherParty.name,
          stars: rating.stars,
          reviewText: rating.review_text,
          visible: rating.visible,
        })),
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load ratings."));
  }
}

export async function getSharedChatData(gigId: string): Promise<SharedChatData> {
  try {
    if (!isSupabaseConfigured()) {
      const currentUser = demoCurrentUser(gigId);
      const otherParty = demoOtherParty(gigId);

      return {
        currentUser,
        otherParty,
        gigTitle: "30-sec food reel for monsoon menu",
        escrowStatus: "held",
        messages: demoMessages.map((message) => ({
          ...message,
          gigId,
          isOwn: message.senderId === currentUser.id,
          senderName:
            message.senderId === currentUser.id ? currentUser.name : otherParty.name,
        })),
      };
    }

    const supabase = createClient();
    const currentUser = await getCurrentProfile();
    const { gig, escrow, otherParty } = await getGigContext(gigId, currentUser);
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("gig_id", gigId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    const sharedMessages = await Promise.all(
      (messages ?? []).map((message) =>
        toSharedMessageFromDatabase(message, currentUser, otherParty),
      ),
    );

    return {
      currentUser,
      otherParty,
      gigTitle: gig.title,
      escrowStatus: escrow?.status ?? "held",
      messages: sharedMessages,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load chat."));
  }
}

export function subscribeToGigMessages(
  gigId: string,
  onChange: () => void,
): () => void {
  if (!isSupabaseConfigured()) {
    return () => undefined;
  }

  const supabase = createClient();
  const channel = supabase
    .channel(`messages:${gigId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `gig_id=eq.${gigId}`,
      },
      () => {
        onChange();
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function markGigMessagesRead(gigId: string): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    const currentUser = await getCurrentProfile();
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("gig_id", gigId)
      .neq("sender_id", currentUser.id);

    if (error) {
      throw error;
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to mark messages as read."));
  }
}

export async function sendSharedMessage(
  gigId: string,
  content: string,
  fileInput?: unknown,
): Promise<SharedMessage | null> {
  try {
    const file = fileInput ? deliverableFileSchema.parse(fileInput) : null;
    const values = chatMessageSchema.parse({
      gigId,
      content: content.trim() || (file ? `Shared ${file.name}` : ""),
    });

    if (!isSupabaseConfigured()) {
      return {
        id: crypto.randomUUID(),
        gigId,
        senderId: demoCurrentUser(gigId).id,
        senderName: demoCurrentUser(gigId).name,
        content: values.content,
        attachment: file
          ? {
              url: URL.createObjectURL(file),
              type: file.type,
              name: file.name,
            }
          : null,
        isOwn: true,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
    }

    const supabase = createClient();
    const currentUser = await getCurrentProfile();
    let attachmentPath: string | null = null;
    let attachmentDisplayUrl: string | null = null;
    let attachmentType: string | null = null;
    let attachmentName: string | null = null;

    if (file) {
      const filePath = `${gigId}/${currentUser.id}/${Date.now()}-${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("gig-deliverables")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("gig-deliverables")
        .createSignedUrl(filePath, 60 * 60);

      if (signedError) {
        throw signedError;
      }

      attachmentPath = filePath;
      attachmentDisplayUrl = signedData.signedUrl;
      attachmentType = file.type;
      attachmentName = file.name;
    }

    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        gig_id: values.gigId,
        sender_id: currentUser.id,
        content: values.content,
        attachment_url: attachmentPath,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    if (!message) {
      return null;
    }

    return {
      id: message.id,
      gigId: message.gig_id,
      senderId: message.sender_id,
      senderName: currentUser.name,
      content: message.content,
      attachment: message.attachment_url
        ? {
            url: attachmentDisplayUrl ?? message.attachment_url,
            type: message.attachment_type ?? "application/octet-stream",
            name: message.attachment_name ?? "Attachment",
          }
        : null,
      isOwn: true,
      isRead: message.is_read,
      createdAt: message.created_at,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to send message."));
  }
}

export async function getSharedTrackerData(
  gigId: string,
): Promise<SharedTrackerData> {
  try {
    if (!isSupabaseConfigured()) {
      const currentUser = demoCurrentUser(gigId);
      const otherParty = demoOtherParty(gigId);
      const status = demoGigStatus(gigId);
      const escrowStatus = gigId.endsWith("released") ? "released" : "held";

      return {
        currentUser,
        otherParty,
        gig: {
          id: gigId,
          title:
            gigId === demoReviewGigId
              ? "Cafe loyalty screen redesign"
              : "30-sec food reel for monsoon menu",
          status,
          deadline: "2026-06-28",
        },
        escrow: {
          id: "escrow-demo",
          status: escrowStatus,
          amountHeld: 18000,
        },
        applicationAccepted: true,
        steps: getTrackerSteps(status, escrowStatus, true),
        ratingState: demoRatingState(gigId),
      };
    }

    const currentUser = await getCurrentProfile();
    const { gig, application, escrow, otherParty } = await getGigContext(
      gigId,
      currentUser,
    );
    const escrowStatus = escrow?.status ?? "held";
    const ratingState = await getRatingState(
      gigId,
      currentUser,
      otherParty,
      escrowStatus,
    );

    return {
      currentUser,
      otherParty,
      gig: {
        id: gig.id,
        title: gig.title,
        status: gig.status,
        deadline: gig.deadline,
      },
      escrow: {
        id: escrow?.id ?? "escrow-pending",
        status: escrowStatus,
        amountHeld: escrow?.amount_held ?? application?.quoted_rate ?? 0,
      },
      applicationAccepted: Boolean(application),
      steps: getTrackerSteps(gig.status, escrowStatus, Boolean(application)),
      ratingState,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load tracker."));
  }
}

export async function submitArtistWork(gigId: string): Promise<void> {
  try {
    const values = submitWorkSchema.parse({ gigId });

    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    const currentUser = await getCurrentProfile();
    const { error: gigError } = await supabase
      .from("gigs")
      .update({ status: "under_review" })
      .eq("id", values.gigId);

    if (gigError) {
      throw gigError;
    }

    const { error: messageError } = await supabase.from("messages").insert({
      gig_id: values.gigId,
      sender_id: currentUser.id,
      content: "Artist has submitted their work for review.",
    });

    if (messageError) {
      throw messageError;
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to submit work."));
  }
}

export async function submitDoubleBlindRating(
  input: RatingInput,
): Promise<RatingState> {
  try {
    const values = ratingSchema.parse(input);

    if (!isSupabaseConfigured()) {
      return {
        escrowReleased: true,
        ownSubmitted: true,
        otherSubmitted: false,
        visibleRatings: [],
      };
    }

    const supabase = createClient();
    const currentUser = await getCurrentProfile();
    const { escrow, otherParty } = await getGigContext(values.gigId, currentUser);
    const { error } = await supabase.from("ratings").insert({
      gig_id: values.gigId,
      rater_id: currentUser.id,
      ratee_id: otherParty.id,
      stars: values.stars,
      review_text: values.reviewText,
      visible: false,
    });

    if (error) {
      throw error;
    }

    return getRatingState(
      values.gigId,
      currentUser,
      otherParty,
      escrow?.status ?? "released",
    );
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to submit rating."));
  }
}

export async function getNotifications(): Promise<NotificationData> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        unreadCount: demoNotifications.filter((item) => !item.isRead).length,
        notifications: demoNotifications.map((item) => ({ ...item })),
      };
    }

    const supabase = createClient();
    const currentUser = await getCurrentProfile();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    const notifications = (data ?? []).map(toNotificationItem);

    return {
      unreadCount: notifications.filter((item) => !item.isRead).length,
      notifications,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load notifications."));
  }
}

export async function markNotificationsRead(): Promise<void> {
  try {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    const currentUser = await getCurrentProfile();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", currentUser.id)
      .eq("is_read", false);

    if (error) {
      throw error;
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to update notifications."));
  }
}

export function mergeMessage(
  messages: SharedMessage[],
  message: SharedMessage | null,
): SharedMessage[] {
  if (!message) {
    return messages;
  }

  if (messages.some((item) => item.id === message.id)) {
    return messages;
  }

  return [...messages, message];
}
