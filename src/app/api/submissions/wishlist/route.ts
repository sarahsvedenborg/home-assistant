import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { submitWishListItem } from "@/sanity/lib/submissions";
import { validateWishListSubmission } from "@/lib/validation";

export async function POST(request: Request) {
  if (isAuthEnabled()) {
    const cookieStore = request.headers.get("cookie") || "";
    const authCookie = cookieStore
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`))
      ?.split("=")
      .slice(1)
      .join("=");

    if (!(await isValidAuthCookie(authCookie))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const payload = await request.json();
  const result = validateWishListSubmission(payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const message = await submitWishListItem(result.data);
    return NextResponse.json({ message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Could not save that wish right now.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
