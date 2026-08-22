import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { validateBoardIssueStatus } from "@/lib/validation";
import { updateBoardIssueStatus } from "@/sanity/lib/submissions";

type RouteContext = {
  params: Promise<{ issueId: string }>;
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

  const result = validateBoardIssueStatus(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const { issueId } = await context.params;
    await updateBoardIssueStatus(issueId, result.data.status);
    return NextResponse.json({ status: result.data.status });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke oppdatere oppgaven akkurat nå.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
