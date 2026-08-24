import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { markShortMessageAsRead } from "@/sanity/lib/submissions";

type RouteContext = {
  params: Promise<{ messageId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
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

  try {
    const { messageId } = await context.params;
    await markShortMessageAsRead(messageId);
    return NextResponse.json({ isRead: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Kunne ikke markere meldingen som lest.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
