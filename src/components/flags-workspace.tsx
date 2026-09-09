"use client";

import { useState } from "react";

import { FeaturedFlag } from "@/components/featured-flag";
import { FlagBrowser } from "@/components/flag-browser";
import type { Country } from "@/lib/types";

export function FlagsWorkspace({
  countries,
  initialCode,
  studiedCodes,
}: {
  countries: Country[];
  initialCode: string;
  studiedCodes: string[];
}) {
  const [studied, setStudied] = useState(() => new Set(studiedCodes));
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStudiedFlag(country: Country, nextStudied: boolean) {
    const previous = new Set(studied);
    setPendingCode(country.code);
    setError(null);
    setStudied((current) => {
      const next = new Set(current);
      if (nextStudied) {
        next.add(country.code);
      } else {
        next.delete(country.code);
      }
      return next;
    });

    try {
      const response = await fetch(
        `/api/flags/${encodeURIComponent(country.code)}/studied`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studied: nextStudied,
            name: country.name,
          }),
        },
      );
      const result = (await response.json()) as {
        studied?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setStudied(previous);
        setError(result.error || "Kunne ikke oppdatere flagget.");
        return;
      }
    } catch {
      setStudied(previous);
      setError("Kunne ikke oppdatere flagget.");
    } finally {
      setPendingCode(null);
    }
  }

  return (
    <>
      <FeaturedFlag
        countries={countries}
        initialCode={initialCode}
        studiedCodes={studied}
        pendingCode={pendingCode}
        onToggleStudied={setStudiedFlag}
      />
      <FlagBrowser
        countries={countries}
        studiedCodes={studied}
        pendingCode={pendingCode}
        onToggleStudied={setStudiedFlag}
      />
      {error ? (
        <p className="feedback feedbackError" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
