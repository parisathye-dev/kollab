import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return { url, publishableKey };
}

export async function createClient() {
  try {
    const { url, publishableKey } = getSupabasePublicEnv();
    const cookieStore = cookies();

    return createServerClient<Database>(url, publishableKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error: unknown) {
            if (process.env.NODE_ENV === "development") {
              console.warn("Supabase server cookies were not writable.", error);
            }
          }
        },
      },
    });
  } catch (error: unknown) {
    throw new Error("Unable to create the Supabase server client.", {
      cause: error,
    });
  }
}
