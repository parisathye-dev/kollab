import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  artistOnboardingSchema,
  avatarFileSchema,
  businessOnboardingSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ArtistOnboardingInput,
  type BusinessOnboardingInput,
  type LoginInput,
  type ProfileRoleInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/lib/validation/auth";
import type { Database, Profile } from "@/types/database";

type ProfileRoleRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "role"
>;

type CurrentProfileResult = {
  user: User;
  profile: Profile;
};

function toErrorMessage(_error: unknown, fallback: string): string {
  return fallback;
}

function createAuthError(error: unknown, fallback: string): Error {
  return new Error(toErrorMessage(error, fallback), { cause: error });
}

function getRedirectUrl(pathname: string, origin: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl =
    appUrl && appUrl !== "your-app-url" ? appUrl.replace(/\/$/, "") : origin;

  return `${baseUrl}${pathname}`;
}

function getHomePath(role: ProfileRoleInput): string {
  return role === "artist" ? "/artist/home" : "/business/home";
}

async function getCurrentUserOrThrow(): Promise<User> {
  try {
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

    return user;
  } catch (error: unknown) {
    throw createAuthError(error, "Unable to read the current session.");
  }
}

export async function registerWithEmail(
  input: RegisterInput,
  origin: string,
): Promise<void> {
  try {
    const values = registerSchema.parse(input);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          role: values.role,
        },
        emailRedirectTo: getRedirectUrl("/onboarding", origin),
      },
    });

    if (error) {
      throw error;
    }
  } catch (error: unknown) {
    throw createAuthError(error, "Registration failed.");
  }
}

export async function loginWithEmail(
  input: LoginInput,
): Promise<ProfileRoleInput> {
  try {
    const values = loginSchema.parse(input);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Unable to find the signed-in user.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .returns<ProfileRoleRow[]>()
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile?.role) {
      throw new Error("Your profile is missing a role.");
    }

    return profile.role;
  } catch (error: unknown) {
    throw createAuthError(
      error,
      "Unable to sign in. Check your email and password.",
    );
  }
}

export async function sendPasswordResetEmail(
  input: ResetPasswordInput,
  origin: string,
): Promise<void> {
  try {
    const values = resetPasswordSchema.parse(input);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: getRedirectUrl("/reset-password", origin),
    });

    if (error) {
      throw error;
    }
  } catch (error: unknown) {
    throw createAuthError(error, "Unable to send the reset email.");
  }
}

export async function getCurrentProfile(): Promise<CurrentProfileResult> {
  try {
    const user = await getCurrentUserOrThrow();
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      throw error;
    }

    return { user, profile };
  } catch (error: unknown) {
    throw createAuthError(error, "Unable to load your KOLLAB profile.");
  }
}

export async function uploadAvatarFile(input: unknown): Promise<string> {
  try {
    const file = avatarFileSchema.parse(input);
    const user = await getCurrentUserOrThrow();
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const filePath = `${user.id}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error: unknown) {
    throw createAuthError(error, "Unable to upload the avatar.");
  }
}

export async function saveArtistOnboarding(
  input: ArtistOnboardingInput,
): Promise<string> {
  try {
    const values = artistOnboardingSchema.parse(input);
    const user = await getCurrentUserOrThrow();
    const supabase = createClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: values.avatar_url,
        location_text: values.location_text,
      })
      .eq("id", user.id);

    if (profileError) {
      throw profileError;
    }

    const { error: artistError } = await supabase
      .from("artist_profiles")
      .upsert(
        {
          id: user.id,
          skills: values.skills,
          rate_min: values.rate_min,
          rate_max: values.rate_max,
          is_open_to_gigs: values.is_open_to_gigs,
        },
        { onConflict: "id" },
      );

    if (artistError) {
      throw artistError;
    }

    return getHomePath("artist");
  } catch (error: unknown) {
    throw createAuthError(error, "Unable to save artist onboarding.");
  }
}

export async function saveBusinessOnboarding(
  input: BusinessOnboardingInput,
): Promise<string> {
  try {
    const values = businessOnboardingSchema.parse(input);
    const user = await getCurrentUserOrThrow();
    const supabase = createClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        location_text: values.location_text,
      })
      .eq("id", user.id);

    if (profileError) {
      throw profileError;
    }

    const { error: businessError } = await supabase
      .from("business_profiles")
      .upsert(
        {
          id: user.id,
          business_name: values.business_name,
          business_type: values.business_type,
        },
        { onConflict: "id" },
      );

    if (businessError) {
      throw businessError;
    }

    return getHomePath("business");
  } catch (error: unknown) {
    throw createAuthError(error, "Unable to save business onboarding.");
  }
}

export { getHomePath };
