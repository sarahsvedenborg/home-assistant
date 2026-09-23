import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { searchBooks } from "@/lib/book-lookup";
import { validateBookSearchQuery } from "@/lib/validation";

async function assertAuthorized(request: Request) {
  if (!isAuthEnabled()) {
    return null;
  }

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

  return null;
}

export async function GET(request: Request) {
  const unauthorizedResponse = await assertAuthorized(request);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const query = new URL(request.url).searchParams.get("q") || "";
  const result = validateBookSearchQuery(query);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const books = await searchBooks(result.data.query);
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke søke etter bøker akkurat nå." },
      { status: 500 },
    );
  }
}
