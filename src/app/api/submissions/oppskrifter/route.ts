import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { validateRecipeSubmission } from "@/lib/validation";
import { submitRecipe } from "@/sanity/lib/submissions";

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
  const result = validateRecipeSubmission(payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const message = await submitRecipe(result.data);
    return NextResponse.json({ message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke lagre oppskriften akkurat naa.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
