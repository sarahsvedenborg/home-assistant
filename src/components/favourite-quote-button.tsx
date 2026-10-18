"use client";

import { useState } from "react";

type FavouriteQuoteButtonProps = {
  text: string;
  author: string;
  initiallyFavourite: boolean;
};

export function FavouriteQuoteButton({
  text,
  author,
  initiallyFavourite,
}: FavouriteQuoteButtonProps) {
  const [favourite, setFavourite] = useState(initiallyFavourite);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleFavourite() {
    const nextFavourite = !favourite;
    setPending(true);
    setError(null);
    setFavourite(nextFavourite);

    try {
      const response = await fetch("/api/quotes/favourite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          author,
          favourite: nextFavourite,
        }),
      });
      const result = (await response.json()) as {
        favourite?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setFavourite(!nextFavourite);
        setError(result.error || "Kunne ikke lagre favoritten.");
        return;
      }

      setFavourite(Boolean(result.favourite));
    } catch {
      setFavourite(!nextFavourite);
      setError("Kunne ikke lagre favoritten.");
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="quoteHeartWrap">
      <button
        type="button"
        className="quoteHeart"
        aria-pressed={favourite}
        aria-label={
          favourite
            ? "Fjern sitatet fra favoritter"
            : "Lagre sitatet som favoritt"
        }
        disabled={pending}
        onClick={toggleFavourite}
      >
        <HeartIcon filled={favourite} />
      </button>
      {error ? (
        <span className="quoteHeartError" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 20.6s-6.7-4.15-8.8-7.85C1.4 9.7 2.6 6.2 6 5.4c2.1-.5 3.8.3 4.7 1.7.2.3.6.3.8 0 .9-1.4 2.6-2.2 4.7-1.7 3.4.8 4.6 4.3 2.8 7.35C18.7 16.45 12 20.6 12 20.6z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
