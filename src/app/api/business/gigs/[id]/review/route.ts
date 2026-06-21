import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitBusinessReviewWithServiceRole } from "@/lib/supabase/business-server";
import { businessReviewSchema } from "@/lib/validation/business";

type RouteContext = {
  params: {
    id: string;
  };
};

function getErrorMessage(_error: unknown): string {
  return "Unable to submit review action.";
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

export async function POST(request: Request, context: RouteContext) {
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
    const values = businessReviewSchema.parse({
      ...body,
      gigId: context.params.id,
    });

    await submitBusinessReviewWithServiceRole(values, user.id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
