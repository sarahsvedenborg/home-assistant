import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { getFamilyMembers } from "@/lib/data";
import { validateBoardIssueSubmission } from "@/lib/validation";
import { submitBoardIssue } from "@/sanity/lib/submissions";

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

  const [payload, familyMembers] = await Promise.all([
    request.json(),
    getFamilyMembers(),
  ]);
  const result = validateBoardIssueSubmission(
    payload,
    familyMembers.map((member) => member.name),
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const message = await submitBoardIssue(result.data);
    return NextResponse.json({ message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke lagre oppgaven akkurat nå.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
