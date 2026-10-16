import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

// Capability-URL guard for the public shared wishlist. The secret token lives
// in WISHLIST_SHARE_TOKEN (server-only, no NEXT_PUBLIC_ prefix) and travels in
// the URL path. Rotate the env var to revoke every existing share link.

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

// Validates a token from the URL against the configured secret using a
// constant-time comparison. Default-DENY: if no secret is configured, every
// candidate is rejected so the page 404s rather than being left wide open.
export function isValidShareToken(candidate?: string | null): boolean {
  const secret = process.env.WISHLIST_SHARE_TOKEN;

  if (!secret || !candidate) {
    return false;
  }

  // Comparing SHA-256 digests keeps both buffers at 32 bytes, so
  // timingSafeEqual never throws on a length mismatch and no length leaks.
  return timingSafeEqual(digest(candidate), digest(secret));
}
