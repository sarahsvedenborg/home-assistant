"use client";

import { useMemo, useState } from "react";

import { FlagMedia } from "@/components/flag-media";
import type { Country } from "@/lib/types";

export function FlagBrowser({ countries }: { countries: Country[] }) {
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

  return (
    <section className="flagBrowser" aria-labelledby="flag-browser-title">
      <div className="flagBrowserHeader">
        <h2 id="flag-browser-title">Alle flagg</h2>
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
        <div className="flagGrid">
          {visibleCountries.map((country) => {
            const isSelected = selectedCode === country.code;

            return (
              <button
                type="button"
                className={isSelected ? "flagCard flagCardSelected" : "flagCard"}
                aria-pressed={isSelected}
                key={country.code}
                onClick={() =>
                  setSelectedCode(isSelected ? null : country.code)
                }
              >
                <FlagMedia country={country} showMap={isSelected} />
                <h3>{country.name}</h3>
                {isSelected && (country.capital || country.continent) ? (
                  <dl className="flagCardFacts">
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
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
