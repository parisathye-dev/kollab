import type {
  ApplicationStatus,
  EscrowStatus,
  PortfolioItem,
  WorkType,
} from "@/types/database";

export type ArtistSkill =
  | "reel_editor"
  | "photographer"
  | "graphic_designer"
  | "ui_ux"
  | "motion_designer"
  | "copywriter"
  | "videographer"
  | "illustrator";

export type ArtistGigStatus =
  | ApplicationStatus
  | "not_applied"
  | "completed"
  | "live";

export type PortfolioItemKind = "image" | "video" | "pdf" | "file";
export type AppearanceMode = "light" | "dark";

export type ArtistProfileDetails = {
  summary: string;
  age: string;
  city: string;
  workStatus: string;
  expenses: string;
  degree: string;
  customSkills: string[];
  appearance: AppearanceMode;
};

export type ArtistSummary = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  locationText: string;
  skills: ArtistSkill[];
  isOpenToGigs: boolean;
  totalGigs: number;
  avgRating: number;
  rateMin: number;
  thisMonthEarnings: number;
  allTimeEarnings: number;
};

export type GigPreview = {
  id: string;
  title: string;
  businessName: string;
  businessAvatarUrl: string | null;
  skillRequired: ArtistSkill;
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  distanceKm: number;
  locationText: string;
  workType: WorkType;
  matchesSkills: boolean;
  status: ArtistGigStatus;
};

export type GigDetail = GigPreview & {
  description: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  referenceUrls: string[];
  alreadyApplied: boolean;
};

export type ApplicationPreview = {
  id: string;
  gigId: string;
  title: string;
  businessName: string;
  status: ApplicationStatus;
  quotedRate: number;
  createdAt: string;
};

export type ArtistDashboardData = {
  artist: ArtistSummary;
  gigsNearYou: GigPreview[];
  recentApplications: ApplicationPreview[];
};

export type ArtistBrowseData = {
  artistSkills: ArtistSkill[];
  gigs: GigPreview[];
};

export type PortfolioItemView = PortfolioItem & {
  id: string;
  kind: PortfolioItemKind;
  createdAt: string;
};

export type ArtistProfileData = {
  artist: ArtistSummary;
  bio: string;
  details: ArtistProfileDetails;
  portfolioItems: PortfolioItemView[];
};

export type EarningsLedgerItem = {
  id: string;
  gigTitle: string;
  businessName: string;
  amount: number;
  status: EscrowStatus;
  createdAt: string;
};

export type ArtistEarningsData = {
  thisMonth: number;
  allTime: number;
  ledger: EarningsLedgerItem[];
};
