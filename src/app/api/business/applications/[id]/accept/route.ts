import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { acceptApplicationWithServiceRole } from "@/lib/supabase/business-server";
import {
  getRouteIdFromContext,
  type IdRouteContext,
} from "@/lib/utils/route-params";

function getErrorMessage(_error: unknown): string {
  return "Unable to accept application.";
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

    const applicationId = await getRouteIdFromContext(request, context, "accept");
    await acceptApplicationWithServiceRole(applicationId, user.id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
