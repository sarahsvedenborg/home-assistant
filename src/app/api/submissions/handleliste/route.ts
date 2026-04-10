import { NextResponse } from "next/server";

import { validateShoppingListSubmission } from "@/lib/validation";
import { submissionPassword } from "@/sanity/env";
import { addShoppingListItem } from "@/sanity/lib/submissions";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = validateShoppingListSubmission(payload);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  if (submissionPassword && result.data.password !== submissionPassword) {
    return NextResponse.json({ error: "Familiepassordet stemte ikke." }, { status: 401 });
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
