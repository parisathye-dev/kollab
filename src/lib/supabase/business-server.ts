import "server-only";

import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  applicationDecisionSchema,
  businessReviewSchema,
  type BusinessReviewInput,
} from "@/lib/validation/business";

const businessActionContextSchema = z
  .object({
    businessId: z.string().uuid(),
  })
  .strict();

function getErrorMessage(_error: unknown, fallback: string): string {
  return fallback;
}

export async function acceptApplicationWithServiceRole(
  applicationId: string,
  businessId: string,
): Promise<void> {
  try {
    const values = applicationDecisionSchema.parse({ applicationId });
    const context = businessActionContextSchema.parse({ businessId });
    const supabase = createServiceRoleClient();

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select("id,gig_id,artist_id,quoted_rate,status")
      .eq("id", values.applicationId)
      .single();

    if (applicationError) {
      throw applicationError;
    }

    if (!application) {
      throw new Error("Application not found.");
    }

    const { data: gig, error: gigError } = await supabase
      .from("gigs")
      .select("id,business_id,status")
      .eq("id", application.gig_id)
      .single();

    if (gigError) {
      throw gigError;
    }

    if (!gig || gig.business_id !== context.businessId) {
      throw new Error("This gig does not belong to the signed-in business.");
    }

    const platformFee = Math.round(application.quoted_rate * 0.1);
    const artistPayout = application.quoted_rate - platformFee;

    const { error: acceptError } = await supabase
      .from("applications")
      .update({ status: "accepted" })
      .eq("id", application.id);

    if (acceptError) {
      throw acceptError;
    }

    const { error: declineError } = await supabase
      .from("applications")
      .update({ status: "rejected" })
      .eq("gig_id", application.gig_id)
      .eq("status", "pending")
      .neq("id", application.id);

    if (declineError) {
      throw declineError;
    }

    const { error: escrowError } = await supabase.from("escrow").insert({
      gig_id: application.gig_id,
      application_id: application.id,
      business_id: context.businessId,
      artist_id: application.artist_id,
      amount_held: application.quoted_rate,
      platform_fee: platformFee,
      artist_payout: artistPayout,
      status: "held",
    });

    if (escrowError) {
      throw escrowError;
    }

    const { error: gigUpdateError } = await supabase
      .from("gigs")
      .update({ status: "in_progress" })
      .eq("id", application.gig_id);

    if (gigUpdateError) {
      throw gigUpdateError;
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to accept application."));
  }
}

export async function submitBusinessReviewWithServiceRole(
  input: BusinessReviewInput,
  businessId: string,
): Promise<void> {
  try {
    const values = businessReviewSchema.parse(input);
    const context = businessActionContextSchema.parse({ businessId });
    const supabase = createServiceRoleClient();

    const { data: gig, error: gigError } = await supabase
      .from("gigs")
      .select("id,business_id,status")
      .eq("id", values.gigId)
      .single();

    if (gigError) {
      throw gigError;
    }

    if (!gig || gig.business_id !== context.businessId) {
      throw new Error("This gig does not belong to the signed-in business.");
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select("id,artist_id")
      .eq("gig_id", values.gigId)
      .eq("status", "accepted")
      .single();

    if (applicationError) {
      throw applicationError;
    }

    if (!application) {
      throw new Error("Accepted application not found.");
    }

    if (values.action === "approve") {
      const { error: escrowError } = await supabase
        .from("escrow")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("gig_id", values.gigId);

      if (escrowError) {
        throw escrowError;
      }

      const { error: gigUpdateError } = await supabase
        .from("gigs")
        .update({ status: "completed" })
        .eq("id", values.gigId);

      if (gigUpdateError) {
        throw gigUpdateError;
      }

      const { error: ratingError } = await supabase.from("ratings").insert({
        gig_id: values.gigId,
        rater_id: context.businessId,
        ratee_id: application.artist_id,
        stars: values.stars ?? 5,
        review_text: values.reviewText ?? null,
      });

      if (ratingError) {
        throw ratingError;
      }

      return;
    }

    if (values.action === "revision") {
      const { error: messageError } = await supabase.from("messages").insert({
        gig_id: values.gigId,
        sender_id: context.businessId,
        content: values.message,
      });

      if (messageError) {
        throw messageError;
      }

      return;
    }

    const { error: disputeError } = await supabase
      .from("escrow")
      .update({ status: "disputed", disputed_at: new Date().toISOString() })
      .eq("gig_id", values.gigId);

    if (disputeError) {
      throw disputeError;
    }

    const { error: messageError } = await supabase.from("messages").insert({
      gig_id: values.gigId,
      sender_id: context.businessId,
      content: `Dispute raised: ${values.message}`,
    });

    if (messageError) {
      throw messageError;
    }
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Unable to submit review action."));
  }
}
