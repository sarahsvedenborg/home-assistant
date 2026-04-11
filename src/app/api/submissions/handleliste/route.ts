import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, isAuthEnabled, isValidAuthCookie } from "@/lib/auth";
import { validateShoppingListSubmission } from "@/lib/validation";
import { addShoppingListItem, toggleShoppingListItem } from "@/sanity/lib/submissions";

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
  const result = validateShoppingListSubmission(payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const message = await addShoppingListItem(result.data);
    return NextResponse.json({ message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke lagre varen akkurat naa.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const unauthorizedResponse = await assertAuthorized(request);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  const payload = (await request.json()) as { id?: string };

  if (!payload.id) {
    return NextResponse.json({ error: "Mangler vare-id." }, { status: 400 });
  }

  try {
    const checked = await toggleShoppingListItem(payload.id);
    return NextResponse.json({ checked });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Kunne ikke oppdatere varen akkurat naa.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
