import "server-only";

import { createClient } from "next-sanity";

import {
  apiVersion,
  canWriteToSanity,
  dataset,
  isSanityConfigured,
  projectId,
  submissionToken,
} from "@/sanity/env";

function buildClient(options?: { token?: string; useCdn?: boolean }) {
  if (!isSanityConfigured) {
    return null;
  }

  return createClient({
    apiVersion,
    dataset,
    projectId,
    token: options?.token,
    useCdn: options?.useCdn ?? true,
  });
}

export function getReadClient() {
  return buildClient({ useCdn: true });
}

export function getFreshReadClient() {
  return buildClient({ useCdn: false });
}

export function getWriteClient() {
  if (!canWriteToSanity) {
    return null;
  }

  return buildClient({ token: submissionToken, useCdn: false });
}
