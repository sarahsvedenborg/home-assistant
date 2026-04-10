import { NextResponse } from "next/server";

import { validateMovieSubmission } from "@/lib/validation";
import { submissionPassword } from "@/sanity/env";
import { submitMovieRecommendation } from "@/sanity/lib/submissions";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = validateMovieSubmission(payload);

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
    const message = await submitMovieRecommendation(result.data);
    return NextResponse.json({ message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Could not save that movie right now.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
