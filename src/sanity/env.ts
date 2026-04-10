export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-04-10";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const studioTitle = "Family Hub Studio";

export const isSanityConfigured = Boolean(projectId && dataset);
export const submissionToken = process.env.SANITY_API_WRITE_TOKEN || "";
export const canWriteToSanity = Boolean(isSanityConfigured && submissionToken);
export const requireApproval = process.env.SANITY_REQUIRE_APPROVAL === "true";
export const submissionPassword =
  process.env.FAMILY_HUB_SUBMISSION_PASSWORD || "";
