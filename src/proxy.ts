import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getSafeRedirectPath, isAuthEnabled, isValidAuthCookie } from "./lib/auth";

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/test-route" ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export async function proxy(request: NextRequest) {
  if (!isAuthEnabled() || isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (await isValidAuthCookie(authCookie)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    getSafeRedirectPath(request.nextUrl.pathname + request.nextUrl.search),
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/:path*"],
};
