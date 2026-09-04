"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkMessageUnreadButton({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markAsUnread() {
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/meldinger/${encodeURIComponent(messageId)}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: false }),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error || "Kunne ikke markere meldingen som ulest.");
        return;
      }

      router.refresh();
    } catch {
      setError("Kunne ikke markere meldingen som ulest.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="messageUnreadAction">
      <button
        type="button"
        className="messageUnreadButton"
        disabled={isUpdating}
        onClick={markAsUnread}
      >
        {isUpdating ? "Lagrer…" : "Marker som ulest"}
      </button>
      {error ? (
        <span className="messageUnreadError" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
