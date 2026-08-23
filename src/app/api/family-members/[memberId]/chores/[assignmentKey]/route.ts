import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { validateChoreAmountChange } from "@/lib/validation";
import { changeMemberChoreAmount } from "@/sanity/lib/submissions";

type RouteContext = {
  params: Promise<{ memberId: string; assignmentKey: string }>;
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

  const result = validateChoreAmountChange(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const { memberId, assignmentKey } = await context.params;
    const amount = await changeMemberChoreAmount(
      memberId,
      assignmentKey,
      result.data.delta,
    );

    return NextResponse.json({ amount });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke oppdatere ukelønnen akkurat nå.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
