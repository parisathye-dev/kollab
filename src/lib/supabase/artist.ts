import { createClient } from "@/lib/supabase/client";
import {
  applyForGigSchema,
  artistProfileEditSchema,
  portfolioFileSchema,
  portfolioTitleSchema,
  type ApplyForGigInput,
  type ArtistProfileEditInput,
  type PortfolioTitleInput,
} from "@/lib/validation/artist";
import type {
  ArtistBrowseData,
  ArtistDashboardData,
  ArtistEarningsData,
  ArtistProfileData,
  ArtistSkill,
  ArtistSummary,
  ApplicationPreview,
  EarningsLedgerItem,
  GigDetail,
  GigPreview,
  PortfolioItemKind,
  PortfolioItemView,
} from "@/types/artist";
import type {
  Application,
  ArtistProfile,
  BusinessProfile,
  Gig,
  PortfolioItem,
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

const demoArtist: ArtistSummary = {
  id: "6fc81fd7-89f2-49be-9efb-90d73a85881d",
  displayName: "Aarav",
  avatarUrl: null,
  locationText: "Thane West, Maharashtra",
  skills: ["reel_editor", "photographer", "ui_ux"],
  isOpenToGigs: true,
  totalGigs: 18,
  avgRating: 4.8,
  rateMin: 8000,
  thisMonthEarnings: 42000,
  allTimeEarnings: 286000,
};

const demoGigs: GigDetail[] = [
  {
    id: "1516a61f-5f80-4716-93b8-c026a08695c9",
    title: "Launch reel for a new monsoon menu",
    businessName: "Blue Tokai Thane",
    businessAvatarUrl: null,
    skillRequired: "reel_editor",
    budgetMin: 12000,
    budgetMax: 18000,
    deadline: "2026-06-28",
    distanceKm: 3.2,
    locationText: "Hiranandani Estate, Thane",
    workType: "in_person",
    matchesSkills: true,
    status: "live",
    description:
      "Create a fast, polished Instagram reel for our monsoon food and coffee menu. We need one hero reel, three short cutdowns, and a clean caption direction that feels local to Thane.",
    latitude: 19.255,
    longitude: 72.982,
    radiusKm: 8,
    referenceUrls: ["https://instagram.com/bluetokai"],
    alreadyApplied: false,
  },
  {
    id: "47deba33-628a-48e3-a6e5-b5f879cc16e2",
    title: "Boutique photoshoot for festive arrivals",
    businessName: "Riwaaz Studio",
    businessAvatarUrl: null,
    skillRequired: "photographer",
    budgetMin: 16000,
    budgetMax: 24000,
    deadline: "2026-07-02",
    distanceKm: 6.8,
    locationText: "Panch Pakhadi, Thane",
    workType: "in_person",
    matchesSkills: true,
    status: "live",
    description:
      "Shoot catalogue-style and lifestyle photographs for 18 festive outfits. The deliverables include edited stills for Instagram, WhatsApp catalogue, and marketplace listings.",
    latitude: 19.194,
    longitude: 72.973,
    radiusKm: 10,
    referenceUrls: [],
    alreadyApplied: true,
  },
  {
    id: "553f8da1-26a2-436c-b397-c741f66af690",
    title: "Landing page refresh for boutique hotel",
    businessName: "Palm Nest Hotel",
    businessAvatarUrl: null,
    skillRequired: "ui_ux",
    budgetMin: 25000,
    budgetMax: 38000,
    deadline: "2026-07-09",
    distanceKm: 14.1,
    locationText: "Powai, Mumbai",
    workType: "remote",
    matchesSkills: true,
    status: "live",
    description:
      "Refresh the booking landing page for a boutique hotel. We need a mobile-first design pass, clearer package cards, and a handoff-ready Figma file.",
    latitude: 19.117,
    longitude: 72.906,
    radiusKm: 25,
    referenceUrls: [],
    alreadyApplied: false,
  },
  {
    id: "71d2fe2e-297d-4e53-9861-d3d015b46abd",
    title: "Menu flyer and social post set",
    businessName: "Bombay Bowl Co.",
    businessAvatarUrl: null,
    skillRequired: "graphic_designer",
    budgetMin: 7000,
    budgetMax: 11000,
    deadline: "2026-06-25",
    distanceKm: 11.4,
    locationText: "Mulund West, Mumbai",
    workType: "either",
    matchesSkills: false,
    status: "live",
    description:
      "Design a new printed menu flyer and six matching social posts for a weekend offer. Existing brand colours and copy will be shared.",
    latitude: 19.172,
    longitude: 72.956,
    radiusKm: 12,
    referenceUrls: [],
    alreadyApplied: false,
  },
];

const demoApplications = [
  {
    id: "d9fb97d8-9133-498a-8f39-5bde75403cd1",
    gigId: demoGigs[1].id,
    title: demoGigs[1].title,
    businessName: demoGigs[1].businessName,
    status: "pending" as const,
    quotedRate: 21000,
    createdAt: "2026-06-20T10:30:00.000Z",
  },
  {
    id: "db035b17-67e2-4246-8e7a-82abebd5f60a",
    gigId: demoGigs[2].id,
    title: demoGigs[2].title,
    businessName: demoGigs[2].businessName,
    status: "accepted" as const,
    quotedRate: 32000,
    createdAt: "2026-06-18T14:20:00.000Z",
  },
];

const demoPortfolio: PortfolioItemView[] = [
  {
    id: "hero-reel",
    url: "demo://hero-reel",
    type: "video/mp4",
    kind: "video",
    title: "Cafe launch reel",
    thumbnail_url: null,
    createdAt: "2026-06-09T08:00:00.000Z",
  },
  {
    id: "lookbook",
    url: "demo://lookbook",
    type: "image/png",
    kind: "image",
    title: "Boutique lookbook edit",
    thumbnail_url: null,
    createdAt: "2026-06-04T08:00:00.000Z",
  },
  {
    id: "ui-kit",
    url: "demo://ui-kit",
    type: "application/pdf",
    kind: "pdf",
    title: "Hotel booking UI deck",
    thumbnail_url: null,
    createdAt: "2026-05-26T08:00:00.000Z",
  },
];

const demoEarnings: EarningsLedgerItem[] = [
  {
    id: "escrow-held",
    gigTitle: "Landing page refresh",
    businessName: "Palm Nest Hotel",
    amount: 32000,
    status: "held",
    createdAt: "2026-06-19T08:00:00.000Z",
  },
  {
    id: "escrow-released",
    gigTitle: "Cafe launch reel",
    businessName: "Blue Tokai Thane",
    amount: 18000,
    status: "released",
    createdAt: "2026-06-12T08:00:00.000Z",
  },
  {
    id: "escrow-disputed",
    gigTitle: "Menu flyer update",
    businessName: "Bombay Bowl Co.",
    amount: 9000,
    status: "disputed",
    createdAt: "2026-06-08T08:00:00.000Z",
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

function clonePortfolioItems(items: PortfolioItemView[]): PortfolioItemView[] {
  return items.map((item) => ({ ...item }));
}

function isArtistSkill(value: string | null | undefined): value is ArtistSkill {
  return artistSkillValues.includes(value as ArtistSkill);
}

function normalizeSkills(skills: string[] | null | undefined): ArtistSkill[] {
  const normalized = (skills ?? []).filter(isArtistSkill);

  return normalized.length > 0 ? normalized : [...demoArtist.skills];
}

function toArtistSummary(
  profile: Profile,
  artistProfile: ArtistProfile | null,
): ArtistSummary {
  return {
    ...demoArtist,
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    locationText: profile.location_text ?? demoArtist.locationText,
    skills: normalizeSkills(artistProfile?.skills),
    isOpenToGigs: artistProfile?.is_open_to_gigs ?? demoArtist.isOpenToGigs,
    totalGigs: artistProfile?.total_gigs ?? demoArtist.totalGigs,
    avgRating: Number(artistProfile?.avg_rating ?? demoArtist.avgRating),
    rateMin: artistProfile?.rate_min ?? demoArtist.rateMin,
  };
}

function toPortfolioView(
  item: PortfolioItem,
  index: number,
): PortfolioItemView {
  return {
    id: `${item.url}-${index}`,
    url: item.url,
    type: item.type,
    kind: getPortfolioKind(item.type),
    title: item.title ?? "Portfolio item",
    thumbnail_url: item.thumbnail_url ?? null,
    createdAt: new Date().toISOString(),
  };
}

function businessNameForGig(
  businessId: string,
  profiles: Map<string, Profile>,
  businessProfiles: Map<string, BusinessProfile>,
): string {
  return (
    businessProfiles.get(businessId)?.business_name ??
    profiles.get(businessId)?.display_name ??
    "Local Business"
  );
}

function toDatabaseGigDetail(
  gig: Gig,
  businessName: string,
  businessAvatarUrl: string | null,
  artistSkills: ArtistSkill[],
  alreadyApplied: boolean,
): GigDetail {
  const skillRequired = isArtistSkill(gig.skill_required)
    ? gig.skill_required
    : "reel_editor";
  const artistStatus =
    gig.status === "completed"
      ? "completed"
      : gig.status === "live"
        ? "live"
        : "not_applied";

  return {
    id: gig.id,
    title: gig.title,
    businessName,
    businessAvatarUrl,
    skillRequired,
    budgetMin: gig.budget_min,
    budgetMax: gig.budget_max,
    deadline: gig.deadline,
    distanceKm: 0,
    locationText: gig.location_text ?? "Remote",
    workType: gig.work_type,
    matchesSkills: artistSkills.includes(skillRequired),
    status: artistStatus,
    description: gig.description,
    latitude: Number(gig.latitude ?? 19.2183),
    longitude: Number(gig.longitude ?? 72.9781),
    radiusKm: gig.radius_km,
    referenceUrls: gig.reference_urls ?? [],
    alreadyApplied,
  };
}

function toGigPreview(gig: GigDetail): GigPreview {
  const {
    description: _description,
    latitude: _latitude,
    longitude: _longitude,
    radiusKm: _radiusKm,
    referenceUrls: _referenceUrls,
    alreadyApplied: _alreadyApplied,
    ...preview
  } = gig;

  return preview;
}

function getPortfolioKind(fileType: string): PortfolioItemKind {
  if (fileType.startsWith("image/")) {
    return "image";
  }

  if (fileType.startsWith("video/")) {
    return "video";
  }

  if (fileType === "application/pdf") {
    return "pdf";
  }

  return "file";
}

function toPortfolioJson(items: PortfolioItemView[]): PortfolioItem[] {
  return items.map((item) => ({
    url: item.url,
    type: item.type,
    title: item.title,
    thumbnail_url: item.thumbnail_url ?? null,
  }));
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

async function getCurrentArtistSummary(): Promise<ArtistSummary> {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  const [
    { data: profile, error: profileError },
    { data: artistProfile, error: artistError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .returns<Profile[]>()
      .maybeSingle(),
    supabase
      .from("artist_profiles")
      .select("*")
      .eq("id", userId)
      .returns<ArtistProfile[]>()
      .maybeSingle(),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (artistError) {
    throw artistError;
  }

  if (!profile) {
    throw new Error("Your artist profile could not be found.");
  }

  return toArtistSummary(profile, artistProfile);
}

async function getBusinessMaps(businessIds: string[]) {
  const supabase = createClient();
  const uniqueIds = Array.from(new Set(businessIds));

  if (uniqueIds.length === 0) {
    return {
      profiles: new Map<string, Profile>(),
      businessProfiles: new Map<string, BusinessProfile>(),
    };
  }

  const [
    { data: profiles, error: profileError },
    { data: businessProfiles, error: businessError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .in("id", uniqueIds)
      .returns<Profile[]>(),
    supabase
      .from("business_profiles")
      .select("*")
      .in("id", uniqueIds)
      .returns<BusinessProfile[]>(),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (businessError) {
    throw businessError;
  }

  return {
    profiles: new Map((profiles ?? []).map((profile) => [profile.id, profile])),
    businessProfiles: new Map(
      (businessProfiles ?? []).map((profile) => [profile.id, profile]),
    ),
  };
}

async function getArtistApplications(
  artistId: string,
): Promise<ApplicationPreview[]> {
  const supabase = createClient();
  const { data: applications, error } = await supabase
    .from("applications")
    .select("*")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<Application[]>();

  if (error) {
    throw error;
  }

  const rows = applications ?? [];
  const gigIds = rows.map((application) => application.gig_id);

  if (gigIds.length === 0) {
    return [];
  }

  const { data: gigs, error: gigsError } = await supabase
    .from("gigs")
    .select("*")
    .in("id", gigIds)
    .returns<Gig[]>();

  if (gigsError) {
    throw gigsError;
  }

  const gigRows = gigs ?? [];
  const gigMap = new Map(gigRows.map((gig) => [gig.id, gig]));
  const businessMaps = await getBusinessMaps(
    gigRows.map((gig) => gig.business_id),
  );

  return rows.flatMap((application) => {
    const gig = gigMap.get(application.gig_id);

    if (!gig) {
      return [];
    }

    return [
      {
        id: application.id,
        gigId: gig.id,
        title: gig.title,
        businessName: businessNameForGig(
          gig.business_id,
          businessMaps.profiles,
          businessMaps.businessProfiles,
        ),
        status: application.status,
        quotedRate: application.quoted_rate,
        createdAt: application.created_at,
      },
    ];
  });
}

async function getLiveGigDetailsForArtist(
  artist: ArtistSummary,
): Promise<GigDetail[]> {
  const supabase = createClient();
  const { data: gigs, error } = await supabase
    .from("gigs")
    .select("*")
    .eq("status", "live")
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<Gig[]>();

  if (error) {
    throw error;
  }

  const rows = gigs ?? [];

  if (rows.length === 0) {
    return [];
  }

  const [
    { data: applications, error: applicationError },
    businessMaps,
  ] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .eq("artist_id", artist.id)
      .in(
        "gig_id",
        rows.map((gig) => gig.id),
      )
      .returns<Application[]>(),
    getBusinessMaps(rows.map((gig) => gig.business_id)),
  ]);

  if (applicationError) {
    throw applicationError;
  }

  const appliedGigIds = new Set(
    (applications ?? []).map((application) => application.gig_id),
  );

  return rows.map((gig) =>
    toDatabaseGigDetail(
      gig,
      businessNameForGig(
        gig.business_id,
        businessMaps.profiles,
        businessMaps.businessProfiles,
      ),
      businessMaps.profiles.get(gig.business_id)?.avatar_url ?? null,
      artist.skills,
      appliedGigIds.has(gig.id),
    ),
  );
}

async function getStoredArtistPortfolio(
  userId: string,
): Promise<PortfolioItemView[]> {
  const supabase = createClient();
  const { data: artistProfile, error } = await supabase
    .from("artist_profiles")
    .select("portfolio_items")
    .eq("id", userId)
    .returns<Pick<ArtistProfile, "portfolio_items">[]>()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (artistProfile?.portfolio_items ?? []).map(toPortfolioView);
}

export async function getArtistDashboardData(): Promise<ArtistDashboardData> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        artist: { ...demoArtist },
        gigsNearYou: demoGigs.map(toGigPreview),
        recentApplications: demoApplications.map((application) => ({
          ...application,
        })),
      };
    }

    const artist = await getCurrentArtistSummary();
    const liveGigs = await getLiveGigDetailsForArtist(artist);
    const recentApplications = await getArtistApplications(artist.id);

    return {
      artist,
      gigsNearYou:
        liveGigs.length > 0
          ? liveGigs.map(toGigPreview)
          : demoGigs.map(toGigPreview),
      recentApplications,
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load artist dashboard."));
  }
}

export async function getArtistBrowseData(): Promise<ArtistBrowseData> {
  try {
    if (isSupabaseConfigured()) {
      const artist = await getCurrentArtistSummary();
      const liveGigs = await getLiveGigDetailsForArtist(artist);

      return {
        artistSkills: [...artist.skills],
        gigs:
          liveGigs.length > 0
            ? liveGigs.map(toGigPreview)
            : demoGigs.map(toGigPreview),
      };
    }

    return {
      artistSkills: [...demoArtist.skills],
      gigs: demoGigs.map(toGigPreview),
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load gigs."));
  }
}

export async function getGigDetail(gigId: string): Promise<GigDetail> {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const artist = await getCurrentArtistSummary();
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
          { data: application, error: applicationError },
          businessMaps,
        ] = await Promise.all([
          supabase
            .from("applications")
            .select("*")
            .eq("artist_id", artist.id)
            .eq("gig_id", gig.id)
            .returns<Application[]>()
            .maybeSingle(),
          getBusinessMaps([gig.business_id]),
        ]);

        if (applicationError) {
          throw applicationError;
        }

        return toDatabaseGigDetail(
          gig,
          businessNameForGig(
            gig.business_id,
            businessMaps.profiles,
            businessMaps.businessProfiles,
          ),
          businessMaps.profiles.get(gig.business_id)?.avatar_url ?? null,
          artist.skills,
          Boolean(application),
        );
      }
    }

    const gig = demoGigs.find((item) => item.id === gigId) ?? demoGigs[0];

    return { ...gig, referenceUrls: [...gig.referenceUrls] };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load the gig."));
  }
}

export async function submitArtistApplication(
  input: ApplyForGigInput,
): Promise<void> {
  try {
    const values = applyForGigSchema.parse(input);

    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    const artistId = await getCurrentUserId();
    const { error } = await supabase.from("applications").insert({
      gig_id: values.gigId,
      artist_id: artistId,
      pitch_text: values.pitchText,
      quoted_rate: values.quotedRate,
      status: "pending",
    });

    if (error) {
      throw error;
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to submit application."));
  }
}

export async function getArtistPortfolio(): Promise<PortfolioItemView[]> {
  try {
    if (isSupabaseConfigured()) {
      const userId = await getCurrentUserId();
      const storedItems = await getStoredArtistPortfolio(userId);

      return storedItems.length > 0
        ? storedItems
        : clonePortfolioItems(demoPortfolio);
    }

    return clonePortfolioItems(demoPortfolio);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load portfolio."));
  }
}

export async function uploadPortfolioItem(fileInput: unknown) {
  try {
    const file = portfolioFileSchema.parse(fileInput);
    const item: PortfolioItemView = {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      type: file.type,
      kind: getPortfolioKind(file.type),
      title: file.name.replace(/\.[^/.]+$/, ""),
      thumbnail_url: null,
      createdAt: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      return item;
    }

    const supabase = createClient();
    const userId = await getCurrentUserId();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${userId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("portfolio-items")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("portfolio-items")
      .getPublicUrl(filePath);
    const savedItem: PortfolioItemView = {
      ...item,
      url: data.publicUrl,
    };
    const currentItems = await getStoredArtistPortfolio(userId);
    const { error: updateError } = await supabase
      .from("artist_profiles")
      .update({
        portfolio_items: toPortfolioJson([savedItem, ...currentItems]),
      })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return savedItem;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to upload portfolio item."));
  }
}

export async function updatePortfolioTitle(
  input: PortfolioTitleInput,
  items: PortfolioItemView[],
): Promise<PortfolioItemView[]> {
  try {
    const values = portfolioTitleSchema.parse(input);
    const nextItems = items.map((item) =>
      item.id === values.id ? { ...item, title: values.title } : item,
    );

    if (!isSupabaseConfigured()) {
      return nextItems;
    }

    const supabase = createClient();
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from("artist_profiles")
      .update({ portfolio_items: toPortfolioJson(nextItems) })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return nextItems;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to update portfolio item."));
  }
}

export async function savePortfolioItems(
  items: PortfolioItemView[],
): Promise<PortfolioItemView[]> {
  try {
    if (!isSupabaseConfigured()) {
      return clonePortfolioItems(items);
    }

    const supabase = createClient();
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from("artist_profiles")
      .update({ portfolio_items: toPortfolioJson(items) })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return clonePortfolioItems(items);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to save portfolio."));
  }
}

export async function getArtistProfileData(): Promise<ArtistProfileData> {
  try {
    if (isSupabaseConfigured()) {
      const artist = await getCurrentArtistSummary();
      const userId = await getCurrentUserId();
      const storedItems = await getStoredArtistPortfolio(userId);
      const supabase = createClient();
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("bio")
        .eq("id", userId)
        .returns<Pick<Profile, "bio">[]>()
        .maybeSingle();

      if (error) {
        throw error;
      }

      return {
        artist,
        bio: profile?.bio ?? "",
        portfolioItems:
          storedItems.length > 0
            ? storedItems
            : clonePortfolioItems(demoPortfolio),
      };
    }

    return {
      artist: { ...demoArtist },
      bio: "I create high-retention reels, warm product photography, and mobile-first design systems for local brands.",
      portfolioItems: clonePortfolioItems(demoPortfolio),
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load artist profile."));
  }
}

export async function updateArtistProfile(
  input: ArtistProfileEditInput,
): Promise<ArtistProfileData> {
  try {
    const values = artistProfileEditSchema.parse(input);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const userId = await getCurrentUserId();
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: values.displayName,
          bio: values.bio,
          location_text: values.locationText,
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      const { error: artistError } = await supabase
        .from("artist_profiles")
        .update({
          skills: values.skills,
          rate_min: values.rateMin,
          is_open_to_gigs: values.isOpenToGigs,
        })
        .eq("id", userId);

      if (artistError) {
        throw artistError;
      }
    }

    return {
      artist: {
        ...demoArtist,
        displayName: values.displayName,
        locationText: values.locationText,
        skills: [...values.skills],
        isOpenToGigs: values.isOpenToGigs,
        rateMin: values.rateMin,
      },
      bio: values.bio,
      portfolioItems: clonePortfolioItems(demoPortfolio),
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to update profile."));
  }
}

export async function setArtistOpenToGigs(value: boolean): Promise<boolean> {
  try {
    if (!isSupabaseConfigured()) {
      return value;
    }

    const supabase = createClient();
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from("artist_profiles")
      .update({ is_open_to_gigs: value })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return value;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to update availability."));
  }
}

export async function getArtistEarningsData(): Promise<ArtistEarningsData> {
  try {
    return {
      thisMonth: demoArtist.thisMonthEarnings,
      allTime: demoArtist.allTimeEarnings,
      ledger: demoEarnings.map((item) => ({ ...item })),
    };
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to load earnings."));
  }
}

export function skillLabel(skill: ArtistSkill): string {
  const labels: Record<ArtistSkill, string> = {
    reel_editor: "Reel Editor",
    photographer: "Photographer",
    graphic_designer: "Graphic Designer",
    ui_ux: "UI/UX",
    motion_designer: "Motion Designer",
    copywriter: "Copywriter",
    videographer: "Videographer",
    illustrator: "Illustrator",
  };

  return labels[skill];
}
