"use client";

import { useEffect, useRef, useState } from "react";

type ShareLinkButtonProps = {
  // Relative path of the share link, e.g. "/familiens-onskeliste/<token>".
  path: string;
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path below.
  }

  // Fallback for non-secure contexts / older browsers.
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function ShareLinkButton({ path }: ShareLinkButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  async function handleClick() {
    const url = `${window.location.origin}${path}`;
    const ok = await copyToClipboard(url);

    setStatus(ok ? "copied" : "error");
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  const label =
    status === "copied" ? "Kopiert! ✓" : status === "error" ? "Kunne ikke kopiere" : "Del lenke";

  return (
    <button
      type="button"
      className="shareLinkButton"
      onClick={handleClick}
      aria-live="polite"
    >
      {label}
    </button>
  );
}
