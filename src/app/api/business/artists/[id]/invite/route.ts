import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inviteArtistSchema } from "@/lib/validation/business";

type RouteContext = {
  params: {
    id: string;
  };
};

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
    inviteArtistSchema.parse({
      artistId: context.params.id,
      gigId: body.gigId,
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
