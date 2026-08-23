import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { resetMemberChoreAmounts } from "@/sanity/lib/submissions";

type RouteContext = {
  params: Promise<{ memberId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
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

  const payload = (await request.json()) as { confirmed?: unknown };

  if (payload.confirmed !== true) {
    return NextResponse.json(
      { error: "En voksen må bekrefte betalingen." },
      { status: 400 },
    );
  }

  try {
    const { memberId } = await context.params;
    await resetMemberChoreAmounts(memberId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke registrere betalingen akkurat nå.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
