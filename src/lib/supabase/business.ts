"use client";

import { createClient } from "@/lib/supabase/client";
import { skillLabel } from "@/lib/supabase/artist";
import {
  applicationDecisionSchema,
  businessArtistFilterSchema,
  businessReviewSchema,
  historySortSchema,
  inviteArtistSchema,
  postGigSchema,
  referenceFilesSchema,
  type ApplicationDecisionInput,
  type BusinessArtistFilterInput,
  type BusinessReviewInput,
  type HistorySortInput,
  type InviteArtistInput,
  type PostGigInput,
} from "@/lib/validation/business";
import type { ArtistSkill } from "@/types/artist";
import type {
  BusinessApplication,
  BusinessArtistDiscoveryData,
  BusinessArtistProfile,
  BusinessRadiusKm,
  BusinessDashboardData,
  BusinessDeliverable,
  BusinessGigDetailData,
  BusinessGigPreview,
  BusinessHistoryData,
  BusinessHistoryItem,
  BusinessReviewData,
  BusinessSummary,
} from "@/types/business";
import type {
  Application,
  ArtistProfile,
  BusinessProfile,
  Escrow,
  Gig,
  Profile,
} from "@/types/database";

const artistSkillValues: ArtistSkill[] = [
  "reel_editor",
  "photographer",
  "graphic_designer",
  "ui_ux",
  "motion_designer",
  "copywriter",
  "videographer",
  "illustrator",
];

const demoBusiness: BusinessSummary = {
  id: "491f9ffd-4413-4af5-b9a5-b8bf0c598799",
  businessName: "Blue Tokai Thane",
  businessType: "Cafe",
  avatarUrl: null,
  liveGigCount: 3,
  pendingApplications: 7,
  totalGigsPosted: 24,
  totalSpent: 412000,
  avgRatingGiven: 4.7,
};

const demoArtists: BusinessArtistProfile[] = [
  {
    id: "6fc81fd7-89f2-49be-9efb-90d73a85881d",
    displayName: "Aarav Mehta",
    avatarUrl: null,
    locationText: "Thane West",
    latitude: 19.2183,
    longitude: 72.9781,
    skills: ["reel_editor", "photographer", "ui_ux"],
    isOpenToGigs: true,
    totalGigs: 18,
    avgRating: 4.8,
    rateMin: 8000,
    rateMax: 18000,
    distanceKm: 3.2,
    bio: "High-retention reels, warm product photography, and mobile-first brand systems for cafes and boutiques.",
    portfolioItems: [
      {
        id: "aarav-reel",
        title: "Cafe launch reel",
        type: "video/mp4",
        url: "demo://aarav-reel",
      },
      {
        id: "aarav-photo",
        title: "Menu photography set",
        type: "image/png",
        url: "demo://aarav-photo",
      },
    ],
  },
  {
    id: "0ed081fb-a4f8-4d79-8a7a-f3b54be6657d",
    displayName: "Mira Shah",
    avatarUrl: null,
    locationText: "Bandra West",
    latitude: 19.0544,
    longitude: 72.8407,
    skills: ["graphic_designer", "illustrator", "copywriter"],
    isOpenToGigs: true,
    totalGigs: 31,
    avgRating: 4.9,
    rateMin: 6500,
    rateMax: 16000,
    distanceKm: 18.4,
    bio: "Illustrated campaign systems, packaging refreshes, and compact copy for local D2C and hospitality brands.",
    portfolioItems: [
      {
        id: "mira-menu",
        title: "Festive menu campaign",
        type: "image/png",
        url: "demo://mira-menu",
      },
    ],
  },
  {
    id: "41ef20af-0ac1-4410-a8d5-5d317aa10ed0",
    displayName: "Kabir Khan",
    avatarUrl: null,
    locationText: "Powai",
    latitude: 19.1176,
    longitude: 72.906,
    skills: ["videographer", "motion_designer", "reel_editor"],
    isOpenToGigs: true,
    totalGigs: 12,
    avgRating: 4.6,
    rateMin: 12000,
    rateMax: 24000,
    distanceKm: 13.7,
    bio: "Sharp product shoots and motion-led short-form edits for food, travel, and retail businesses.",
    portfolioItems: [
      {
        id: "kabir-video",
        title: "Boutique hotel walkthrough",
        type: "video/mp4",
        url: "demo://kabir-video",
      },
    ],
  },
  {
    id: "97c94440-2742-493e-b6d6-78708a1b0f33",
    displayName: "Ira Nair",
    avatarUrl: null,
    locationText: "Mulund West",
    latitude: 19.1726,
    longitude: 72.9425,
    skills: ["ui_ux", "graphic_designer"],
    isOpenToGigs: false,
    totalGigs: 22,
    avgRating: 4.5,
    rateMin: 15000,
    rateMax: 28000,
    distanceKm: 8.9,
    bio: "Booking flows, landing pages, and conversion-focused visual systems for neighborhood services.",
    portfolioItems: [
      {
        id: "ira-ui",
        title: "Salon booking flow",
        type: "application/pdf",
        url: "demo://ira-ui",
      },
    ],
  },
];

const demoGigs: BusinessGigPreview[] = [
  {
    id: "1516a61f-5f80-4716-93b8-c026a08695c9",
    title: "30-sec food reel for monsoon menu",
    description:
      "Create a crisp Instagram reel for our new monsoon food menu. We need one hero reel, three cutdowns, and cover frames that feel warm, local, and appetite-first.",
    skillRequired: "reel_editor",
    budgetMin: 12000,
    budgetMax: 18000,
    deadline: "2026-06-28",
    locationText: "Hiranandani Estate, Thane",
    latitude: 19.255,
    longitude: 72.982,
    radiusKm: 10,
    workType: "in_person",
    status: "live",
    referenceUrls: ["https://instagram.com/bluetokai"],
    applicantCount: 5,
    pendingApplications: 4,
  },
  {
    id: "3c21f150-fd5f-46e0-9b16-14e850cc50f3",
    title: "Festive menu flyer and post set",
    description:
      "Design a compact menu flyer and matching social set for a weekend festive offer. The work includes printable artwork, Instagram posts, and editable source files.",
    skillRequired: "graphic_designer",
    budgetMin: 7000,
    budgetMax: 11000,
    deadline: "2026-07-03",
    locationText: "Thane West",
    latitude: 19.2183,
    longitude: 72.9781,
    radiusKm: 25,
    workType: "either",
    status: "live",
    referenceUrls: [],
    applicantCount: 2,
    pendingApplications: 2,
  },
  {
    id: "d4801f93-232c-46b1-965c-e5ad68e3c645",
    title: "Cafe loyalty screen redesign",
    description:
      "Refresh the mobile loyalty screen used by repeat customers. We need a tighter UI flow, offer cards, and an implementation-ready Figma handoff.",
    skillRequired: "ui_ux",
    budgetMin: 18000,
    budgetMax: 25000,
    deadline: "2026-07-12",
    locationText: "Remote",
    latitude: 19.076,
    longitude: 72.8777,
    radiusKm: 999,
    workType: "remote",
    status: "under_review",
    referenceUrls: [],
    applicantCount: 9,
    pendingApplications: 0,
  },
];

const demoApplications: BusinessApplication[] = [
  {
    id: "a64af554-5338-4fde-9c8d-3d2c284315d3",
    artist: demoArtists[0],
    pitchText:
      "I can shoot in-store during low rush hours, build a tight 30-second reel around the drinks and plated dishes, and deliver cutdowns sized for Reels and Stories.",
    quotedRate: 16000,
    status: "pending",
    createdAt: "2026-06-20T08:30:00.000Z",
  },
  {
    id: "e00a03a1-ea11-4724-a971-bb7d7f70d175",
    artist: demoArtists[2],
    pitchText:
      "I will bring a compact light kit, capture motion-heavy prep shots, and edit a premium reel with captions and two alternate hooks for testing.",
    quotedRate: 18000,
    status: "pending",
    createdAt: "2026-06-19T10:40:00.000Z",
  },
  {
    id: "c815299f-126b-498c-8ed1-8e50c8c8d8d4",
    artist: demoArtists[1],
    pitchText:
      "I can translate the monsoon campaign into a visual system and support the reel with cover art and story tiles if the scope needs it.",
    quotedRate: 14000,
    status: "rejected",
    createdAt: "2026-06-18T11:20:00.000Z",
  },
];

const demoDeliverables: BusinessDeliverable[] = [
  {
    id: "delivery-hero-reel",
    title: "Hero reel final cut",
    type: "video",
    url: "demo://delivery-hero-reel",
    createdAt: "2026-06-25T09:15:00.000Z",
  },
  {
    id: "delivery-cover",
    title: "Cover frame pack",
    type: "image",
    url: "demo://delivery-cover",
    createdAt: "2026-06-25T09:16:00.000Z",
  },
  {
    id: "delivery-caption",
    title: "Caption and upload notes",
    type: "pdf",
    url: "demo://delivery-caption",
    createdAt: "2026-06-25T09:17:00.000Z",
  },
];

const demoHistory: BusinessHistoryItem[] = [
  {
    id: "history-1",
    title: "Cold brew launch photo set",
    artistName: "Aarav Mehta",
    artistAvatarUrl: null,
    completedAt: "2026-06-10T08:00:00.000Z",
    finalAmount: 18000,
    ratingGiven: 5,
    skillRequired: "photographer",
  },
  {
    id: "history-2",
    title: "Summer loyalty card refresh",
    artistName: "Ira Nair",
    artistAvatarUrl: null,
    completedAt: "2026-05-28T08:00:00.000Z",
    finalAmount: 22000,
    ratingGiven: 4,
    skillRequired: "ui_ux",
  },
  {
    id: "history-3",
    title: "Weekend brunch poster kit",
    artistName: "Mira Shah",
    artistAvatarUrl: null,
    completedAt: "2026-05-14T08:00:00.000Z",
    finalAmount: 9000,
    ratingGiven: 5,
    skillRequired: "graphic_designer",
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

function cloneGig(gig: BusinessGigPreview): BusinessGigPreview {
  return { ...gig, referenceUrls: [...gig.referenceUrls] };
}

function cloneArtist(artist: BusinessArtistProfile): BusinessArtistProfile {
  return {
    ...artist,
    skills: [...artist.skills],
    portfolioItems: artist.portfolioItems.map((item) => ({ ...item })),
  };
}

function cloneApplication(
  application: BusinessApplication,
): BusinessApplication {
  return {
    ...application,
    artist: cloneArtist(application.artist),
  };
}

function sortedHistory(
  items: BusinessHistoryItem[],
  sortKey: HistorySortInput,
): BusinessHistoryItem[] {
  const nextItems = items.map((item) => ({ ...item }));

  if (sortKey === "amount") {
    return nextItems.sort((first, second) => second.finalAmount - first.finalAmount);
  }

  if (sortKey === "rating") {
    return nextItems.sort((first, second) => second.ratingGiven - first.ratingGiven);
  }

  return nextItems.sort(
    (first, second) =>
      new Date(second.completedAt).getTime() -
      new Date(first.completedAt).getTime(),
  );
}

function filteredArtists(
  filters: BusinessArtistFilterInput,
): BusinessArtistProfile[] {
  return demoArtists
    .filter((artist) => {
      const matchesSkill =
        filters.skill === "all" || artist.skills.includes(filters.skill);
      const matchesBudget = artist.rateMin <= filters.maxBudget;
      const matchesDistance = artist.distanceKm <= filters.distanceKm;
      const matchesRating = artist.avgRating >= filters.ratingMinimum;

      return matchesSkill && matchesBudget && matchesDistance && matchesRating;
    })
    .map(cloneArtist);
}

function isArtistSkill(value: string | null | undefined): value is ArtistSkill {
  return artistSkillValues.includes(value as ArtistSkill);
}

function normalizeSkills(skills: string[] | null | undefined): ArtistSkill[] {
  const normalized = (skills ?? []).filter(isArtistSkill);

  return normalized.length > 0 ? normalized : ["reel_editor"];
}

function normalizeRadius(radiusKm: number): BusinessRadiusKm {
  if (radiusKm === 5 || radiusKm === 10 || radiusKm === 25) {
    return radiusKm;
  }

  return 999;
}

function businessTypeLabel(value: string | null): string {
  if (!value) {
    return "Business";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toBusinessSummary(
  profile: Profile,
  businessProfile: BusinessProfile | null,
  gigs: Gig[],
  applications: Application[],
): BusinessSummary {
  return {
    id: profile.id,
    businessName: businessProfile?.business_name ?? profile.display_name,
    businessType: businessTypeLabel(businessProfile?.business_type ?? null),
    avatarUrl: profile.avatar_url,
    liveGigCount: gigs.filter((gig) => gig.status === "live").length,
    pendingApplications: applications.filter(
      (application) => application.status === "pending",
    ).length,
    totalGigsPosted: gigs.length,
    totalSpent: demoBusiness.totalSpent,
    avgRatingGiven: demoBusiness.avgRatingGiven,
  };
}

function toBusinessGigPreviewFromDatabase(
  gig: Gig,
  applications: Application[],
): BusinessGigPreview {
  const skillRequired = isArtistSkill(gig.skill_required)
    ? gig.skill_required
    : "reel_editor";

  return {
    id: gig.id,
    title: gig.title,
    description: gig.description,
    skillRequired,
    budgetMin: gig.budget_min,
    budgetMax: gig.budget_max,
    deadline: gig.deadline,
    locationText: gig.location_text ?? "Remote",
    latitude: Number(gig.latitude ?? 19.2183),
    longitude: Number(gig.longitude ?? 72.9781),
    radiusKm: normalizeRadius(gig.radius_km),
    workType: gig.work_type,
    status: gig.status,
    referenceUrls: gig.reference_urls ?? [],
    applicantCount: applications.length,
    pendingApplications: applications.filter(
      (application) => application.status === "pending",
    ).length,
  };
}

function toBusinessArtistFromDatabase(
  profile: Profile,
  artistProfile: ArtistProfile | null,
): BusinessArtistProfile {
  const portfolioItems = (artistProfile?.portfolio_items ?? []).map(
    (item, index) => ({
      id: `${item.url}-${index}`,
      title: item.title ?? "Portfolio item",
      type: item.type,
      url: item.url,
    }),
  );

  return {
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    locationText: profile.location_text ?? "Mumbai",
    latitude: Number(profile.latitude ?? 19.2183),
    longitude: Number(profile.longitude ?? 72.9781),
    skills: normalizeSkills(artistProfile?.skills),
    isOpenToGigs: artistProfile?.is_open_to_gigs ?? true,
    totalGigs: artistProfile?.total_gigs ?? 0,
    avgRating: Number(artistProfile?.avg_rating ?? 0),
    rateMin: artistProfile?.rate_min ?? 0,
    rateMax: artistProfile?.rate_max ?? artistProfile?.rate_min ?? 0,
    distanceKm: 0,
    bio: profile.bio ?? "",
    portfolioItems,
  };
}

async function getCurrentBusinessRows() {
  const supabase = createClient();
  const businessId = await getCurrentUserId();
  const [
    { data: profile, error: profileError },
    { data: businessProfile, error: businessError },
    { data: gigs, error: gigsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", businessId)
      .returns<Profile[]>()
      .maybeSingle(),
    supabase
      .from("business_profiles")
      .select("*")
      .eq("id", businessId)
      .returns<BusinessProfile[]>()
      .maybeSingle(),
    supabase
      .from("gigs")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .returns<Gig[]>(),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (businessError) {
    throw businessError;
  }

  if (gigsError) {
    throw gigsError;
  }

  if (!profile) {
    throw new Error("Your business profile could not be found.");
  }

  return {
    profile,
    businessProfile,
    gigs: gigs ?? [],
  };
}

async function getApplicationsForGigs(gigIds: string[]): Promise<Application[]> {
  if (gigIds.length === 0) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .in("gig_id", gigIds)
    .returns<Application[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getCurrentUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("You need to be signed in.");
  }

  return user.id;
}

async function parseJsonResponse(response: Response): Promise<Record<string, unknown>> {
  try {
    const payload = await response.json();

    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }

    return {};
  } catch (error: unknown) {
    return {};
  }
}

async function postJson(path: string, body: Record<string, unknown>): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await parseJsonResponse(response);
    const message =
      typeof payload.error === "string" ? payload.error : "Request failed.";

    throw new Error(message);
  }
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function getBusinessDashboardData(): Promise<BusinessDashboardData> {
  try {
    if (isSupabaseConfigured()) {
      const { profile, businessProfile, gigs } = await getCurrentBusinessRows();
      const applications = await getApplicationsForGigs(gigs.map((gig) => gig.id));
      const applicationsByGig = new Map<string, Application[]>();

      applications.forEach((application) => {
        const current = applicationsByGig.get(application.gig_id) ?? [];
        applicationsByGig.set(application.gig_id, [...current, application]);
      });

      return {
        business: toBusinessSummary(
          profile,
          businessProfile,
          gigs,
          applications,
        ),
        activeGigs:
          gigs.length > 0
            ? gigs.map((gig) =>
                toBusinessGigPreviewFromDatabase(
                  gig,
                  applicationsByGig.get(gig.id) ?? [],
                ),
              )
            : demoGigs.map(cloneGig),
      };
    }

    return {
      business: { ...demoBusiness },
      activeGigs: demoGigs.map(cloneGig),
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load business dashboard."));
  }
}

export async function createBusinessGig(
  input: PostGigInput,
  fileInput: unknown[],
): Promise<string> {
  try {
    const values = postGigSchema.parse(input);
    const files = referenceFilesSchema.parse(fileInput);

    if (!isSupabaseConfigured()) {
      return crypto.randomUUID();
    }

    const supabase = createClient();
    const businessId = await getCurrentUserId();
    const referenceUrls: string[] = [];

    for (const file of files) {
      const filePath = `${businessId}/${Date.now()}-${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("gig-attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("gig-attachments")
        .getPublicUrl(filePath);
      referenceUrls.push(data.publicUrl);
    }

    const { data, error } = await supabase
      .from("gigs")
      .insert({
        business_id: businessId,
        title: values.title,
        description: values.description,
        skill_required: values.skillRequired,
        budget_min: values.budgetMin,
        budget_max: values.budgetMax,
        deadline: values.deadline,
        location_text: values.locationText,
        latitude: 19.2183,
        longitude: 72.9781,
        radius_km: values.radiusKm,
        work_type: values.workType,
        reference_urls: referenceUrls,
        status: "live",
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      throw new Error("Gig was created but no ID was returned.");
    }

    return data.id;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to post gig."));
  }
}

export async function getBusinessArtistDiscoveryData(
  filters: BusinessArtistFilterInput = {
    skill: "all",
    maxBudget: 25000,
    distanceKm: 25,
    ratingMinimum: 0,
  },
): Promise<BusinessArtistDiscoveryData> {
  try {
    const values = businessArtistFilterSchema.parse(filters);

    let activeGigs: Pick<BusinessGigPreview, "id" | "title" | "skillRequired">[] =
      demoGigs
        .filter((gig) => gig.status === "live")
        .map((gig) => ({
          id: gig.id,
          title: gig.title,
          skillRequired: gig.skillRequired,
        }));

    if (isSupabaseConfigured()) {
      const { gigs } = await getCurrentBusinessRows();
      const realGigs = gigs
        .filter((gig) => gig.status === "live")
        .map((gig) => ({
          id: gig.id,
          title: gig.title,
          skillRequired: isArtistSkill(gig.skill_required)
            ? gig.skill_required
            : "reel_editor",
        }));

      if (realGigs.length > 0) {
        activeGigs = realGigs;
      }
    }

    return {
      artists: filteredArtists(values),
      activeGigs,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load artists."));
  }
}

export async function getBusinessArtistProfile(
  artistId: string,
): Promise<BusinessArtistProfile> {
  try {
    const artist = demoArtists.find((item) => item.id === artistId) ?? demoArtists[0];

    return cloneArtist(artist);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load artist profile."));
  }
}

export async function inviteArtistToGig(input: InviteArtistInput): Promise<void> {
  try {
    inviteArtistSchema.parse(input);

    if (!isSupabaseConfigured()) {
      return;
    }

    await postJson(`/api/business/artists/${input.artistId}/invite`, {
      gigId: input.gigId,
    });
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to send invite."));
  }
}

export async function getBusinessGigDetail(
  gigId: string,
): Promise<BusinessGigDetailData> {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data: gig, error } = await supabase
        .from("gigs")
        .select("*")
        .eq("id", gigId)
        .returns<Gig[]>()
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (gig) {
        const [
          { data: applications, error: applicationsError },
          { data: escrow, error: escrowError },
        ] = await Promise.all([
          supabase
            .from("applications")
            .select("*")
            .eq("gig_id", gig.id)
            .returns<Application[]>(),
          supabase
            .from("escrow")
            .select("*")
            .eq("gig_id", gig.id)
            .returns<Escrow[]>()
            .maybeSingle(),
        ]);

        if (applicationsError) {
          throw applicationsError;
        }

        if (escrowError) {
          throw escrowError;
        }

        const applicationRows = applications ?? [];
        const artistIds = applicationRows.map(
          (application) => application.artist_id,
        );
        const [
          { data: artistProfiles, error: profilesError },
          { data: artistRows, error: artistRowsError },
        ] =
          artistIds.length > 0
            ? await Promise.all([
                supabase
                  .from("profiles")
                  .select("*")
                  .in("id", artistIds)
                  .returns<Profile[]>(),
                supabase
                  .from("artist_profiles")
                  .select("*")
                  .in("id", artistIds)
                  .returns<ArtistProfile[]>(),
              ])
            : [
                { data: [], error: null },
                { data: [], error: null },
              ];

        if (profilesError) {
          throw profilesError;
        }

        if (artistRowsError) {
          throw artistRowsError;
        }

        const profileMap = new Map(
          (artistProfiles ?? []).map((profile) => [profile.id, profile]),
        );
        const artistMap = new Map(
          (artistRows ?? []).map((profile) => [profile.id, profile]),
        );

        return {
          gig: toBusinessGigPreviewFromDatabase(gig, applicationRows),
          applications: applicationRows.flatMap((application) => {
            const profile = profileMap.get(application.artist_id);

            if (!profile) {
              return [];
            }

            return [
              {
                id: application.id,
                artist: toBusinessArtistFromDatabase(
                  profile,
                  artistMap.get(profile.id) ?? null,
                ),
                pitchText: application.pitch_text,
                quotedRate: application.quoted_rate,
                status: application.status,
                createdAt: application.created_at,
              },
            ];
          }),
          escrow: escrow
            ? {
                id: escrow.id,
                status: escrow.status,
                amountHeld: escrow.amount_held,
                artistPayout: escrow.artist_payout,
              }
            : null,
        };
      }
    }

    const gig = demoGigs.find((item) => item.id === gigId) ?? demoGigs[0];
    const isReviewGig = gig.status === "under_review";

    return {
      gig: cloneGig(gig),
      applications: demoApplications.map((application) => ({
        ...cloneApplication(application),
        status: isReviewGig && application.id === demoApplications[0].id ? "accepted" : application.status,
      })),
      escrow: isReviewGig
        ? {
            id: "escrow-under-review",
            status: "held",
            amountHeld: 24000,
            artistPayout: 21600,
          }
        : null,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load gig."));
  }
}

export async function acceptBusinessApplication(
  input: ApplicationDecisionInput,
): Promise<void> {
  try {
    const values = applicationDecisionSchema.parse(input);

    if (!isSupabaseConfigured()) {
      return;
    }

    await postJson(`/api/business/applications/${values.applicationId}/accept`, {});
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to accept application."));
  }
}

export async function getBusinessReviewData(
  gigId: string,
): Promise<BusinessReviewData> {
  try {
    const gig = demoGigs.find((item) => item.id === gigId) ?? demoGigs[2];

    return {
      gig: {
        ...cloneGig(gig),
        status: "under_review",
      },
      artist: cloneArtist(demoArtists[0]),
      escrow: {
        id: "escrow-under-review",
        status: "held",
        amountHeld: 24000,
      },
      deliverables: demoDeliverables.map((item) => ({ ...item })),
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load review data."));
  }
}

export async function submitBusinessReviewAction(
  input: BusinessReviewInput,
): Promise<void> {
  try {
    const values = businessReviewSchema.parse(input);

    if (!isSupabaseConfigured()) {
      return;
    }

    await postJson(`/api/business/gigs/${values.gigId}/review`, values);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to submit review action."));
  }
}

export async function getBusinessHistoryData(
  sortKey: HistorySortInput = "date",
): Promise<BusinessHistoryData> {
  try {
    const values = historySortSchema.parse(sortKey);

    return {
      items: sortedHistory(demoHistory, values),
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load gig history."));
  }
}

export function businessSkillLabel(skill: ArtistSkill): string {
  return skillLabel(skill);
}
