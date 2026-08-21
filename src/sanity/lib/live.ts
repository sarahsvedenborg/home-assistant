import { createClient } from "next-sanity";
import { defineLive } from "next-sanity/live";

import { apiVersion, dataset, projectId } from "@/sanity/env";

// Dedicated client for the Live Content API. apiVersion must be recent enough
// for the API to return syncTags (env default is well past the minimum).
const liveClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

// We only display published content on the kiosk, so no viewer token is needed.
// Opting out of tokens also silences the draft-mode dev warnings.
export const { sanityFetch, SanityLive } = defineLive({
  client: liveClient,
  serverToken: false,
  browserToken: false,
});
