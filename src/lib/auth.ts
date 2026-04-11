const textEncoder = new TextEncoder();

export const AUTH_COOKIE_NAME = "family_hub_auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 * 6;

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return Array.from(new Uint8Array(digest))
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("");
}

export function isAuthEnabled() {
  return Boolean(process.env.FAMILY_HUB_SUBMISSION_PASSWORD);
}

export async function createAuthCookieValue(password: string) {
  return sha256(password);
}

export async function isValidAuthCookie(cookieValue?: string | null) {
  const password = process.env.FAMILY_HUB_SUBMISSION_PASSWORD;

  if (!password) {
    return true;
  }

  if (!cookieValue) {
    return false;
  }

  return cookieValue === (await sha256(password));
}

export function getSafeRedirectPath(nextPath?: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/";
  }

  if (nextPath.startsWith("/login") || nextPath.startsWith("/api/auth")) {
    return "/";
  }

  return nextPath;
}
