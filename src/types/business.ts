import type { ArtistSkill } from "@/types/artist";
import type {
  ApplicationStatus,
  EscrowStatus,
  GigStatus,
  WorkType,
} from "@/types/database";

export type BusinessRadiusKm = 5 | 10 | 25 | 999;
export type BusinessSortKey = "date" | "amount" | "rating";
export type BusinessReviewAction = "approve" | "revision" | "dispute";

export type BusinessSummary = {
  id: string;
  businessName: string;
  businessType: string;
  avatarUrl: string | null;
  liveGigCount: number;
  pendingApplications: number;
  totalGigsPosted: number;
  totalSpent: number;
  avgRatingGiven: number;
};

export type BusinessGigPreview = {
  id: string;
  title: string;
  description: string;
  skillRequired: ArtistSkill;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  locationText: string;
  latitude: number;
  longitude: number;
  radiusKm: BusinessRadiusKm;
  workType: WorkType;
  status: GigStatus;
  referenceUrls: string[];
  applicantCount: number;
  pendingApplications: number;
};

export type BusinessDashboardData = {
  business: BusinessSummary;
  activeGigs: BusinessGigPreview[];
};

export type BusinessArtistProfile = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  locationText: string;
  latitude: number;
  longitude: number;
  skills: ArtistSkill[];
  isOpenToGigs: boolean;
  totalGigs: number;
  avgRating: number;
  rateMin: number;
  rateMax: number;
  distanceKm: number;
  bio: string;
  portfolioItems: {
    id: string;
    title: string;
    type: string;
    url: string;
  }[];
};

export type BusinessArtistDiscoveryData = {
  artists: BusinessArtistProfile[];
  activeGigs: Pick<BusinessGigPreview, "id" | "title" | "skillRequired">[];
};

export type BusinessApplication = {
  id: string;
  artist: BusinessArtistProfile;
  pitchText: string;
  quotedRate: number;
  status: ApplicationStatus;
  createdAt: string;
};

export type BusinessGigDetailData = {
  gig: BusinessGigPreview;
  applications: BusinessApplication[];
  escrow: {
    id: string;
    status: EscrowStatus;
    amountHeld: number;
    artistPayout: number;
  } | null;
};

export type BusinessDeliverable = {
  id: string;
  title: string;
  type: "image" | "video" | "pdf" | "link";
  url: string;
  createdAt: string;
};

export type BusinessReviewData = {
  gig: BusinessGigPreview;
  artist: BusinessArtistProfile;
  escrow: {
    id: string;
    status: EscrowStatus;
    amountHeld: number;
  };
  deliverables: BusinessDeliverable[];
};

export type BusinessHistoryItem = {
  id: string;
  title: string;
  artistName: string;
  artistAvatarUrl: string | null;
  completedAt: string;
  finalAmount: number;
  ratingGiven: number;
  skillRequired: ArtistSkill;
};

export type BusinessHistoryData = {
  items: BusinessHistoryItem[];
};
