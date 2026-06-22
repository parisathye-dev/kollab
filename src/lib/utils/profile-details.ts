import type { AppearanceMode, ArtistProfileDetails } from "@/types/artist";

const metadataVersion = "kollab_artist_profile_v1";

const emptyDetails: ArtistProfileDetails = {
  summary: "",
  age: "",
  city: "",
  workStatus: "",
  expenses: "",
  degree: "",
  customSkills: [],
  appearance: "light",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readAppearance(value: unknown): AppearanceMode {
  return value === "dark" ? "dark" : "light";
}

export function normalizeCustomSkill(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 32);
}

export function normalizeCustomSkills(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map(normalizeCustomSkill)
        .filter((value) => value.length > 0),
    ),
  ).slice(0, 8);
}

export function parseArtistProfileDetails(
  rawBio: string | null | undefined,
): ArtistProfileDetails {
  const raw = rawBio?.trim() ?? "";

  if (!raw) {
    return { ...emptyDetails };
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || parsed.version !== metadataVersion) {
      return { ...emptyDetails, summary: raw };
    }

    return {
      summary: readString(parsed.summary),
      age: readString(parsed.age),
      city: readString(parsed.city),
      workStatus: readString(parsed.workStatus),
      expenses: readString(parsed.expenses),
      degree: readString(parsed.degree),
      customSkills: normalizeCustomSkills(
        Array.isArray(parsed.customSkills)
          ? parsed.customSkills.filter(
              (value): value is string => typeof value === "string",
            )
          : [],
      ),
      appearance: readAppearance(parsed.appearance),
    };
  } catch (error: unknown) {
    return { ...emptyDetails, summary: raw };
  }
}

export function serializeArtistProfileDetails(
  details: ArtistProfileDetails,
): string {
  return JSON.stringify({
    version: metadataVersion,
    summary: details.summary.trim(),
    age: details.age.trim(),
    city: details.city.trim(),
    workStatus: details.workStatus.trim(),
    expenses: details.expenses.trim(),
    degree: details.degree.trim(),
    customSkills: normalizeCustomSkills(details.customSkills),
    appearance: details.appearance,
  });
}
