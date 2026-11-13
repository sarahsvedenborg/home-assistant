"use server";

import { revalidateTag } from "next/cache";
import type { SyncTag } from "@sanity/client";

// The built-in live handler marks tags stale and returns nothing, so an open
// screen keeps rendering the cached list. Expire the tags immediately and tell
// the browser to render again.
export async function revalidateLiveTags(tags: SyncTag[]): Promise<"refresh"> {
  revalidateTag("sanity:fetch-sync-tags", { expire: 0 });

  for (const tag of tags) {
    revalidateTag(`sanity:${tag}`, { expire: 0 });
  }

  return "refresh";
}
