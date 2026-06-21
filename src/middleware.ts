import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const LOGIN_PATH = "/login";

function isRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    isRoute(pathname, "/auth") ||
    isRoute(pathname, LOGIN_PATH) ||
    isRoute(pathname, "/register") ||
    isRoute(pathname, "/reset") ||
    isRoute(pathname, "/reset-password")
  );
}

function redirectToLogin(request: NextRequest): NextResponse {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = LOGIN_PATH;

  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (nextPath !== LOGIN_PATH) {
    redirectUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(redirectUrl);
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = request.nextUrl;
    const { response, user, role } = await updateSession(request);

    if (isPublicRoute(pathname)) {
      return response;
    }

    if (isRoute(pathname, "/artist") && role !== "artist") {
      return redirectToLogin(request);
    }

    if (isRoute(pathname, "/business") && role !== "business") {
      return redirectToLogin(request);
    }

    if (isRoute(pathname, "/shared") && !user) {
      return redirectToLogin(request);
    }

    return response;
  } catch (error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.warn("KOLLAB middleware failed.", error);
    }

    return redirectToLogin(request);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
