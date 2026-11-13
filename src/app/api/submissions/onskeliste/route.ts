import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { validateWishListSubmission } from "@/lib/validation";
import {
  setWishListItemNotApplicable,
  submitWishListItem,
} from "@/sanity/lib/submissions";

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

  const payload = await request.json();
  const result = validateWishListSubmission(payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const message = await submitWishListItem(result.data);
    return NextResponse.json({ message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke lagre ønsket akkurat nå.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const unauthorizedResponse = await assertAuthorized(request);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const payload = (await request.json()) as {
    id?: unknown;
    notApplicable?: unknown;
  };

  if (typeof payload.id !== "string" || !payload.id) {
    return NextResponse.json({ error: "Mangler ønske-id." }, { status: 400 });
  }

  if (typeof payload.notApplicable !== "boolean") {
    return NextResponse.json(
      { error: "Mangler gyldig status for ønsket." },
      { status: 400 },
    );
  }

  try {
    const notApplicable = await setWishListItemNotApplicable(
      payload.id,
      payload.notApplicable,
    );
    revalidateTag("wishlist", { expire: 0 });
    return NextResponse.json({ notApplicable });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke oppdatere ønsket akkurat nå.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
