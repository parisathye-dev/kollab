import type {
  EscrowStatus,
  GigStatus,
  ProfileRole,
  Timestamp,
} from "@/types/database";

export type NotificationType =
  | "NEW_APPLICATION"
  | "APPLICATION_ACCEPTED"
  | "WORK_SUBMITTED"
  | "PAYMENT_RELEASED"
  | "NEW_MESSAGE";

export type SharedParty = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: ProfileRole;
};

export type ChatAttachment = {
  url: string;
  type: string;
  name: string;
} | null;

export type SharedMessage = {
  id: string;
  gigId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachment: ChatAttachment;
  isOwn: boolean;
  isRead: boolean;
  createdAt: Timestamp;
};

export type SharedChatData = {
  currentUser: SharedParty;
  otherParty: SharedParty;
  gigTitle: string;
  escrowStatus: EscrowStatus;
  messages: SharedMessage[];
};

export type TrackerStepState = "done" | "active" | "waiting";

export type TrackerStep = {
  key: "posted" | "hired" | "in_progress" | "under_review" | "completed";
  label: string;
  state: TrackerStepState;
  tone: "green" | "orange" | "yellow" | "teal" | "muted";
};

export type RatingView = {
  id: string;
  raterName: string;
  stars: number;
  reviewText: string | null;
  visible: boolean;
};

export type RatingState = {
  escrowReleased: boolean;
  ownSubmitted: boolean;
  otherSubmitted: boolean;
  visibleRatings: RatingView[];
};

export type SharedTrackerData = {
  currentUser: SharedParty;
  otherParty: SharedParty;
  gig: {
    id: string;
    title: string;
    status: GigStatus;
    deadline: string;
  };
  escrow: {
    id: string;
    status: EscrowStatus;
    amountHeld: number;
  };
  applicationAccepted: boolean;
  steps: TrackerStep[];
  ratingState: RatingState;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
};

export type NotificationData = {
  unreadCount: number;
  notifications: NotificationItem[];
};
