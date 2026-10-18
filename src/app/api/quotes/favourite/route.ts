import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { QUOTE_AUTHOR_MAX, QUOTE_TEXT_MAX } from "@/lib/quotes";
import { setFavouriteQuote } from "@/sanity/lib/submissions";

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

export async function POST(request: Request) {
  const unauthorizedResponse = await assertAuthorized(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const payload = (await request.json().catch(() => null)) as {
    text?: unknown;
    author?: unknown;
    favourite?: unknown;
  } | null;

  const text = typeof payload?.text === "string" ? payload.text.trim() : "";
  const author = typeof payload?.author === "string" ? payload.author.trim() : "";

  if (!text || text.length > QUOTE_TEXT_MAX || !author || author.length > QUOTE_AUTHOR_MAX) {
    return NextResponse.json({ error: "Sitatet kan ikke lagres." }, { status: 400 });
  }

  if (typeof payload?.favourite !== "boolean") {
    return NextResponse.json(
      { error: "Velg om sitatet skal være en favoritt." },
      { status: 400 },
    );
  }

  try {
    const favourite = await setFavouriteQuote({
      text,
      author,
      favourite: payload.favourite,
    });

    return NextResponse.json({ favourite });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke lagre favoritten.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
