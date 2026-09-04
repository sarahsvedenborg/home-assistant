import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { setShortMessageReadState } from "@/sanity/lib/submissions";

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

  const payload = (await request.json()) as { isRead?: unknown };
  if (typeof payload.isRead !== "boolean") {
    return NextResponse.json(
      { error: "Velg om meldingen skal være lest eller ulest." },
      { status: 400 },
    );
  }

  try {
    const { messageId } = await context.params;
    await setShortMessageReadState(messageId, payload.isRead);
    return NextResponse.json({ isRead: payload.isRead });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Kunne ikke markere meldingen som lest.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
