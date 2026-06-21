import { createBrowserClient } from "@supabase/ssr";
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

export function createClient() {
  try {
    const { url, publishableKey } = getSupabasePublicEnv();

    return createBrowserClient<Database>(url, publishableKey);
  } catch (error: unknown) {
    throw new Error("Unable to create the Supabase browser client.", {
      cause: error,
    });
  }
}
