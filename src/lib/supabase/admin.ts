import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type SupabaseAdminEnv = {
  url: string;
  serviceRoleKey: string;
};

function getSupabaseAdminEnv(): SupabaseAdminEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !url ||
    !serviceRoleKey ||
    url === "your-supabase-url" ||
    serviceRoleKey === "your-service-role-key"
  ) {
    throw new Error("Missing Supabase service role environment variables.");
  }

  return { url, serviceRoleKey };
}

export function createServiceRoleClient() {
  try {
    const { url, serviceRoleKey } = getSupabaseAdminEnv();

    return createSupabaseClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error: unknown) {
    throw new Error("Unable to create the Supabase service role client.", {
      cause: error,
    });
  }
}
