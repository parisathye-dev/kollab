export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Timestamp = string;
export type DateString = string;

export type ProfileRole = "artist" | "business";
export type WorkType = "in_person" | "remote" | "either";
export type GigStatus =
  | "draft"
  | "live"
  | "in_progress"
  | "under_review"
  | "completed"
  | "cancelled";
export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn";
export type EscrowStatus = "held" | "released" | "refunded" | "disputed";
export type NotificationType =
  | "NEW_APPLICATION"
  | "APPLICATION_ACCEPTED"
  | "WORK_SUBMITTED"
  | "PAYMENT_RELEASED"
  | "NEW_MESSAGE";

export interface PortfolioItem {
  url: string;
  type: string;
  title?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
}

export interface Profile {
  id: string;
  role: ProfileRole;
  display_name: string;
  bio: string | null;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  avatar_url: string | null;
  phone: string | null;
  is_verified: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProfileInsert {
  id: string;
  role: ProfileRole;
  display_name: string;
  bio?: string | null;
  location_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  avatar_url?: string | null;
  phone?: string | null;
  is_verified?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface ProfileUpdate {
  id?: string;
  role?: ProfileRole;
  display_name?: string;
  bio?: string | null;
  location_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  avatar_url?: string | null;
  phone?: string | null;
  is_verified?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface ArtistProfile {
  id: string;
  skills: string[] | null;
  rate_min: number | null;
  rate_max: number | null;
  portfolio_items: PortfolioItem[] | null;
  is_open_to_gigs: boolean;
  total_gigs: number;
  avg_rating: number;
}

export interface ArtistProfileInsert {
  id: string;
  skills?: string[] | null;
  rate_min?: number | null;
  rate_max?: number | null;
  portfolio_items?: PortfolioItem[] | null;
  is_open_to_gigs?: boolean;
  total_gigs?: number;
  avg_rating?: number;
}

export interface ArtistProfileUpdate {
  id?: string;
  skills?: string[] | null;
  rate_min?: number | null;
  rate_max?: number | null;
  portfolio_items?: PortfolioItem[] | null;
  is_open_to_gigs?: boolean;
  total_gigs?: number;
  avg_rating?: number;
}

export interface BusinessProfile {
  id: string;
  business_name: string;
  business_type: string | null;
  gst_number: string | null;
  website_url: string | null;
}

export interface BusinessProfileInsert {
  id: string;
  business_name: string;
  business_type?: string | null;
  gst_number?: string | null;
  website_url?: string | null;
}

export interface BusinessProfileUpdate {
  id?: string;
  business_name?: string;
  business_type?: string | null;
  gst_number?: string | null;
  website_url?: string | null;
}

export interface Gig {
  id: string;
  business_id: string;
  title: string;
  description: string;
  skill_required: string;
  budget_min: number;
  budget_max: number;
  deadline: DateString;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_km: number;
  work_type: WorkType;
  reference_urls: string[] | null;
  status: GigStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface GigInsert {
  id?: string;
  business_id: string;
  title: string;
  description: string;
  skill_required: string;
  budget_min: number;
  budget_max: number;
  deadline: DateString;
  location_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radius_km?: number;
  work_type?: WorkType;
  reference_urls?: string[] | null;
  status?: GigStatus;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface GigUpdate {
  id?: string;
  business_id?: string;
  title?: string;
  description?: string;
  skill_required?: string;
  budget_min?: number;
  budget_max?: number;
  deadline?: DateString;
  location_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radius_km?: number;
  work_type?: WorkType;
  reference_urls?: string[] | null;
  status?: GigStatus;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export interface Application {
  id: string;
  gig_id: string;
  artist_id: string;
  pitch_text: string;
  quoted_rate: number;
  status: ApplicationStatus;
  created_at: Timestamp;
}

export interface ApplicationInsert {
  id?: string;
  gig_id: string;
  artist_id: string;
  pitch_text: string;
  quoted_rate: number;
  status?: ApplicationStatus;
  created_at?: Timestamp;
}

export interface ApplicationUpdate {
  id?: string;
  gig_id?: string;
  artist_id?: string;
  pitch_text?: string;
  quoted_rate?: number;
  status?: ApplicationStatus;
  created_at?: Timestamp;
}

export interface Escrow {
  id: string;
  gig_id: string;
  application_id: string;
  business_id: string;
  artist_id: string;
  amount_held: number;
  platform_fee: number;
  artist_payout: number;
  status: EscrowStatus;
  disputed_at: Timestamp | null;
  released_at: Timestamp | null;
  created_at: Timestamp;
}

export interface EscrowInsert {
  id?: string;
  gig_id: string;
  application_id: string;
  business_id: string;
  artist_id: string;
  amount_held: number;
  platform_fee: number;
  artist_payout: number;
  status?: EscrowStatus;
  disputed_at?: Timestamp | null;
  released_at?: Timestamp | null;
  created_at?: Timestamp;
}

export interface EscrowUpdate {
  id?: string;
  gig_id?: string;
  application_id?: string;
  business_id?: string;
  artist_id?: string;
  amount_held?: number;
  platform_fee?: number;
  artist_payout?: number;
  status?: EscrowStatus;
  disputed_at?: Timestamp | null;
  released_at?: Timestamp | null;
  created_at?: Timestamp;
}

export interface Message {
  id: string;
  gig_id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
  is_read: boolean;
  created_at: Timestamp;
}

export interface MessageInsert {
  id?: string;
  gig_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
  is_read?: boolean;
  created_at?: Timestamp;
}

export interface MessageUpdate {
  id?: string;
  gig_id?: string;
  sender_id?: string;
  content?: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
  is_read?: boolean;
  created_at?: Timestamp;
}

export interface Rating {
  id: string;
  gig_id: string;
  rater_id: string;
  ratee_id: string;
  stars: number;
  review_text: string | null;
  submitted_at: Timestamp;
  visible: boolean;
}

export interface RatingInsert {
  id?: string;
  gig_id: string;
  rater_id: string;
  ratee_id: string;
  stars: number;
  review_text?: string | null;
  submitted_at?: Timestamp;
  visible?: boolean;
}

export interface RatingUpdate {
  id?: string;
  gig_id?: string;
  rater_id?: string;
  ratee_id?: string;
  stars?: number;
  review_text?: string | null;
  submitted_at?: Timestamp;
  visible?: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: Timestamp;
}

export interface NotificationInsert {
  id?: string;
  user_id: string;
  type: NotificationType;
  message: string;
  is_read?: boolean;
  created_at?: Timestamp;
}

export interface NotificationUpdate {
  id?: string;
  user_id?: string;
  type?: NotificationType;
  message?: string;
  is_read?: boolean;
  created_at?: Timestamp;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile & Record<string, unknown>;
        Insert: ProfileInsert & Record<string, unknown>;
        Update: ProfileUpdate & Record<string, unknown>;
        Relationships: [];
      };
      artist_profiles: {
        Row: ArtistProfile & Record<string, unknown>;
        Insert: ArtistProfileInsert & Record<string, unknown>;
        Update: ArtistProfileUpdate & Record<string, unknown>;
        Relationships: [];
      };
      business_profiles: {
        Row: BusinessProfile & Record<string, unknown>;
        Insert: BusinessProfileInsert & Record<string, unknown>;
        Update: BusinessProfileUpdate & Record<string, unknown>;
        Relationships: [];
      };
      gigs: {
        Row: Gig & Record<string, unknown>;
        Insert: GigInsert & Record<string, unknown>;
        Update: GigUpdate & Record<string, unknown>;
        Relationships: [];
      };
      applications: {
        Row: Application & Record<string, unknown>;
        Insert: ApplicationInsert & Record<string, unknown>;
        Update: ApplicationUpdate & Record<string, unknown>;
        Relationships: [];
      };
      escrow: {
        Row: Escrow & Record<string, unknown>;
        Insert: EscrowInsert & Record<string, unknown>;
        Update: EscrowUpdate & Record<string, unknown>;
        Relationships: [];
      };
      messages: {
        Row: Message & Record<string, unknown>;
        Insert: MessageInsert & Record<string, unknown>;
        Update: MessageUpdate & Record<string, unknown>;
        Relationships: [];
      };
      ratings: {
        Row: Rating & Record<string, unknown>;
        Insert: RatingInsert & Record<string, unknown>;
        Update: RatingUpdate & Record<string, unknown>;
        Relationships: [];
      };
      notifications: {
        Row: Notification & Record<string, unknown>;
        Insert: NotificationInsert & Record<string, unknown>;
        Update: NotificationUpdate & Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
