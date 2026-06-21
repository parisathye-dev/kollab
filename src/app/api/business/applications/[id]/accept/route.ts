import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { acceptApplicationWithServiceRole } from "@/lib/supabase/business-server";

type RouteContext = {
  params: {
    id: string;
  };
};

function getErrorMessage(_error: unknown): string {
  return "Unable to accept application.";
}

export async function POST(_request: Request, context: RouteContext) {
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

    await acceptApplicationWithServiceRole(context.params.id, user.id);

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
