import { createServerClient } from "@supabase/ssr/dist/module/createServerClient";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Database } from "@/types/database";

const profileRoleSchema = z.enum(["artist", "business"]);

export type ProfileRole = z.infer<typeof profileRoleSchema>;

type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

type MiddlewareSession = {
  response: NextResponse;
  user: User | null;
  role: ProfileRole | null;
};

type ProfileRoleRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "role"
>;

function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !url ||
    !publishableKey ||
    url === "your-supabase-url" ||
    publishableKey === "your-anon-key"
  ) {
    return null;
  }

  return { url, publishableKey };
}

function parseProfileRole(role: unknown): ProfileRole | null {
  const result = profileRoleSchema.safeParse(role);

  return result.success ? result.data : null;
}

function createPassThroughResponse(request: NextRequest): NextResponse {
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export async function updateSession(
  request: NextRequest,
): Promise<MiddlewareSession> {
  try {
    let response = createPassThroughResponse(request);
    const env = getSupabasePublicEnv();

    if (!env) {
      return { response, user: null, role: null };
    }

    const supabase = createServerClient<Database>(env.url, env.publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = createPassThroughResponse(request);

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { response, user: null, role: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .returns<ProfileRoleRow[]>()
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    return {
      response,
      user,
      role: parseProfileRole(profile?.role),
    };
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Supabase middleware session update failed.", error);
    }

    return {
      response: createPassThroughResponse(request),
      user: null,
      role: null,
    };
  }
}
