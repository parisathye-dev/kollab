import "server-only";

import { submitWorkSchema } from "@/lib/validation/shared";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function getErrorMessage(_error: unknown, fallback: string): string {
  return fallback;
}

export async function submitArtistWorkWithServiceRole(
  gigId: string,
  artistId: string,
): Promise<void> {
  try {
    const values = submitWorkSchema.parse({ gigId });
    const supabase = createServiceRoleClient();

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select("id,gig_id,artist_id,status")
      .eq("gig_id", values.gigId)
      .eq("artist_id", artistId)
      .eq("status", "accepted")
      .single();

    if (applicationError) {
      throw applicationError;
    }

    if (!application) {
      throw new Error("Accepted application not found.");
    }

    const { data: gig, error: gigError } = await supabase
      .from("gigs")
      .select("id,business_id,status")
      .eq("id", values.gigId)
      .single();

    if (gigError) {
      throw gigError;
    }

    if (!gig) {
      throw new Error("Gig not found.");
    }

    if (gig.status === "completed" || gig.status === "cancelled") {
      throw new Error("Gig is already closed.");
    }

    if (gig.status !== "under_review") {
      const { error: gigUpdateError } = await supabase
        .from("gigs")
        .update({ status: "under_review" })
        .eq("id", values.gigId);

      if (gigUpdateError) {
        throw gigUpdateError;
      }
    }

    const { error: messageError } = await supabase.from("messages").insert({
      gig_id: values.gigId,
      sender_id: artistId,
      content: "Artist has submitted their work for review.",
    });

    if (messageError) {
      throw messageError;
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: gig.business_id,
        type: "WORK_SUBMITTED",
        message: "Artist has submitted their work for review",
      });

    if (notificationError) {
      throw notificationError;
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to submit work."));
  }
}
