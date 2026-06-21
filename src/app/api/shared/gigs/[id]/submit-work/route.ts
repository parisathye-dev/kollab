import { NextResponse } from "next/server";
import { getRouteIdFromContext, type IdRouteContext } from "@/lib/utils/route-params";
import { createClient } from "@/lib/supabase/server";
import { submitArtistWorkWithServiceRole } from "@/lib/supabase/shared-server";

function getErrorMessage(_error: unknown): string {
  return "Unable to submit work.";
}

export async function POST(request: Request, context: IdRouteContext) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const gigId = await getRouteIdFromContext(request, context, "submit-work");
    await submitArtistWorkWithServiceRole(gigId, user.id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
