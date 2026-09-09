"use client";

import { useMemo, useState } from "react";

import { FlagMedia } from "@/components/flag-media";
import type { Country } from "@/lib/types";

export function FeaturedFlag({
  countries,
  initialCode,
  studiedCodes,
  pendingCode,
  onToggleStudied,
}: {
  countries: Country[];
  initialCode: string;
  studiedCodes: Set<string>;
  pendingCode: string | null;
  onToggleStudied: (country: Country, studied: boolean) => void;
}) {
  const startIndex = useMemo(() => {
    const index = countries.findIndex((country) => country.code === initialCode);
    return index >= 0 ? index : 0;
  }, [countries, initialCode]);
  const [index, setIndex] = useState(startIndex);
  const country = countries[index];

  if (!country) {
    return null;
  }

  const canNavigate = countries.length > 1;
  const isStudied = studiedCodes.has(country.code);
  const isPending = pendingCode === country.code;

  function showPrevious() {
    setIndex((current) => (current - 1 + countries.length) % countries.length);
  }

  function showNext() {
    setIndex((current) => (current + 1) % countries.length);
  }

  return (
    <section className="flagHero" aria-labelledby="daily-flag-title">
      <div className="flagHeroToolbar">
        {canNavigate ? (
          <button
            type="button"
            className="calendarIconButton"
            aria-label="Forrige flagg"
            onClick={showPrevious}
          >
            ‹
          </button>
        ) : null}
        <div className="flagHeroHeading">
          <span className="kicker">
            {country.code === initialCode ? "Dagens flagg" : "Flagg"}
          </span>
          <h2 id="daily-flag-title">{country.name}</h2>
        </div>
        {canNavigate ? (
          <button
            type="button"
            className="calendarIconButton"
            aria-label="Neste flagg"
            onClick={showNext}
          >
            ›
          </button>
        ) : null}
      </div>

      {country.capital || country.continent ? (
        <dl className="flagCardFacts flagHeroFacts">
          {country.capital ? (
            <div>
              <dt>Hovedstad</dt>
              <dd>{country.capital}</dd>
            </div>
          ) : null}
          {country.continent ? (
            <div>
              <dt>Kontinent</dt>
              <dd>{country.continent}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <FlagMedia country={country} featured key={country.code} />

      <div className="flagHeroActions">
        <button
          type="button"
          className={
            isStudied
              ? "flagStudyButton flagStudyButtonActive"
              : "flagStudyButton"
          }
          disabled={isPending}
          onClick={() => onToggleStudied(country, !isStudied)}
        >
          {isPending
            ? "Lagrer…"
            : isStudied
              ? "Studert"
              : "Marker som studert"}
        </button>
      </div>
    </section>
  );
}
