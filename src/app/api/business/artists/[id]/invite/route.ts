import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { inviteArtistSchema } from "@/lib/validation/business";
import {
  getRouteIdFromContext,
  type IdRouteContext,
} from "@/lib/utils/route-params";

function getErrorMessage(_error: unknown): string {
  return "Unable to send invite.";
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();

    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }

    return {};
  } catch (error: unknown) {
    return {};
  }
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

    const body = await readJsonBody(request);
    const artistId = await getRouteIdFromContext(request, context, "invite");
    const values = inviteArtistSchema.parse({
      artistId,
      gigId: body.gigId,
    });
    const admin = createServiceRoleClient();
    const [
      { data: gig, error: gigError },
      { data: artist, error: artistError },
      { data: businessProfile, error: businessProfileError },
    ] = await Promise.all([
      admin
        .from("gigs")
        .select("id,title,business_id,status")
        .eq("id", values.gigId)
        .single(),
      admin
        .from("profiles")
        .select("id,role,display_name")
        .eq("id", values.artistId)
        .single(),
      admin
        .from("business_profiles")
        .select("business_name")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (gigError) {
      throw gigError;
    }

    if (artistError) {
      throw artistError;
    }

    if (businessProfileError) {
      throw businessProfileError;
    }

    if (!gig || gig.business_id !== user.id) {
      return NextResponse.json({ error: "Gig not found." }, { status: 404 });
    }

    if (!artist || artist.role !== "artist") {
      return NextResponse.json({ error: "Artist not found." }, { status: 404 });
    }

    const businessName = businessProfile?.business_name ?? "A local business";
    const { error: notificationError } = await admin
      .from("notifications")
      .insert({
        user_id: values.artistId,
        type: "NEW_MESSAGE",
        message: `${businessName} invited you to review "${gig.title}"`,
      });

    if (notificationError) {
      throw notificationError;
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
