import { NextResponse } from "next/server";

import { validateWishListSubmission } from "@/lib/validation";
import { submissionPassword } from "@/sanity/env";
import { submitWishListItem } from "@/sanity/lib/submissions";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = validateWishListSubmission(payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (submissionPassword && result.data.password !== submissionPassword) {
    return NextResponse.json(
      { error: "That family password did not match." },
      { status: 401 },
    );
  }

  try {
    const message = await submitWishListItem(result.data);
    return NextResponse.json({ message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Could not save that wish right now.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
