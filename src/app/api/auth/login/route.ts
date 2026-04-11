import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  createAuthCookieValue,
  getSafeRedirectPath,
  isAuthEnabled,
} from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const nextPath = getSafeRedirectPath(String(formData.get("next") || "/"));
  const loginUrl = new URL(`/login?error=1&next=${encodeURIComponent(nextPath)}`, request.url);

  if (!isAuthEnabled()) {
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  if (password !== process.env.FAMILY_HUB_SUBMISSION_PASSWORD) {
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: await createAuthCookieValue(password),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  return response;
}
