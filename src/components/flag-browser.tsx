"use client";

import { useMemo, useState } from "react";

import { FlagFacts } from "@/components/flag-facts";
import { FlagMedia } from "@/components/flag-media";
import type { Country } from "@/lib/types";

function FlagCard({
  country,
  isSelected,
  isStudied,
  isPending,
  onSelect,
  onToggleStudied,
}: {
  country: Country;
  isSelected: boolean;
  isStudied: boolean;
  isPending: boolean;
  onSelect: () => void;
  onToggleStudied: (country: Country, studied: boolean) => void;
}) {
  return (
    <article
      className={
        [
          "flagCard",
          isSelected ? "flagCardSelected" : "",
          isStudied ? "flagCardStudied" : "",
          country.kind === "independent" ? "" : "flagCardBonus",
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <button
        type="button"
        className="flagCardToggle"
        aria-pressed={isSelected}
        onClick={onSelect}
      >
        <FlagMedia country={country} showMap={isSelected} />
        <h3>{country.name}</h3>
        {country.kind === "constituent" ? (
          <span className="flagBonusBadge">Del av {country.partOf}</span>
        ) : null}
        {country.kind === "territory" ? (
          <span className="flagBonusBadge">Territorium</span>
        ) : null}
        {isStudied ? (
          <span className="flagStudiedBadge">Studert</span>
        ) : null}
        {isSelected ? <FlagFacts country={country} /> : null}
      </button>
      {isSelected ? (
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
      ) : null}
    </article>
  );
}

export function FlagBrowser({
  countries,
  studiedCodes,
  pendingCode,
  onToggleStudied,
}: {
  countries: Country[];
  studiedCodes: Set<string>;
  pendingCode: string | null;
  onToggleStudied: (country: Country, studied: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const visibleCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("nb");

    if (!normalizedQuery) {
      return countries;
    }

    return countries.filter(
      (country) =>
        country.name.toLocaleLowerCase("nb").includes(normalizedQuery) ||
        country.code.includes(normalizedQuery),
    );
  }, [countries, query]);

  const independentCountries = visibleCountries.filter(
    (country) => country.kind === "independent",
  );
  const constituentCountries = visibleCountries.filter(
    (country) => country.kind === "constituent",
  );
  const territoryCountries = visibleCountries.filter(
    (country) => country.kind === "territory",
  );

  function renderCards(list: Country[]) {
    return list.map((country) => {
      const isSelected = selectedCode === country.code;
      const isStudied = studiedCodes.has(country.code);
      const isPending = pendingCode === country.code;

      return (
        <FlagCard
          country={country}
          isSelected={isSelected}
          isStudied={isStudied}
          isPending={isPending}
          onSelect={() => setSelectedCode(isSelected ? null : country.code)}
          onToggleStudied={onToggleStudied}
          key={country.code}
        />
      );
    });
  }

  return (
    <section className="flagBrowser" aria-labelledby="flag-browser-title">
      <div className="flagBrowserHeader">
        <h2 id="flag-browser-title">Alle land</h2>
        <label className="flagSearch">
          <span className="srOnly">Søk etter land</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Søk etter land…"
          />
        </label>
      </div>

      {visibleCountries.length === 0 ? (
        <p className="flagBrowserEmpty">Ingen land matcher søket.</p>
      ) : (
        <>
          {independentCountries.length > 0 ? (
            <div className="flagGrid">{renderCards(independentCountries)}</div>
          ) : null}

          {constituentCountries.length > 0 ? (
            <section
              className="flagBonusSection"
              aria-labelledby="flag-bonus-title"
            >
              <div className="flagBonusIntro">
                <h3 id="flag-bonus-title">Del av Storbritannia</h3>
                <p>
                  Disse har egne flagg, men er ikke selvstendige stater.
                </p>
              </div>
              <div className="flagGrid">{renderCards(constituentCountries)}</div>
            </section>
          ) : null}

          {territoryCountries.length > 0 ? (
            <section
              className="flagBonusSection"
              aria-labelledby="flag-territory-title"
            >
              <div className="flagBonusIntro">
                <h3 id="flag-territory-title">Territorier</h3>
                <p>
                  Disse har egne flagg, men er territorier og ikke selvstendige
                  stater.
                </p>
              </div>
              <div className="flagGrid">{renderCards(territoryCountries)}</div>
            </section>
          ) : null}
        </>
      )}
    </section>
  );
}
