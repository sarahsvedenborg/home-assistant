import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { getWastePickups } from "@/lib/waste-calendar";

const PRIVATE_NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: PRIVATE_NO_STORE },
      );
    }
  }

  try {
    const pickups = await getWastePickups();
    return NextResponse.json({ pickups }, { headers: PRIVATE_NO_STORE });
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke hente tømmekalenderen." },
      { status: 502, headers: PRIVATE_NO_STORE },
    );
  }
}
