import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { setStudiedFlag } from "@/sanity/lib/submissions";

type RouteContext = {
  params: Promise<{ code: string }>;
};

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

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorizedResponse = await assertAuthorized(request);
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const { code } = await context.params;
  const normalizedCode = code.toLowerCase();

  if (!/^[a-z]{2}$/.test(normalizedCode)) {
    return NextResponse.json({ error: "Ugyldig landkode." }, { status: 400 });
  }

  const payload = (await request.json()) as {
    studied?: unknown;
    name?: unknown;
  };

  if (typeof payload.studied !== "boolean") {
    return NextResponse.json(
      { error: "Velg om flagget er studert." },
      { status: 400 },
    );
  }

  try {
    const studied = await setStudiedFlag(
      normalizedCode,
      payload.studied,
      typeof payload.name === "string" ? payload.name : undefined,
    );
    return NextResponse.json({ studied });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Kunne ikke oppdatere studert flagg.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
