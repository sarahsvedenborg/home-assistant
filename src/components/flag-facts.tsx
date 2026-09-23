import type { Country } from "@/lib/types";

export function FlagFacts({
  country,
  className,
}: {
  country: Country;
  className?: string;
}) {
  const hasFacts = Boolean(country.capital || country.continent);

  if (!hasFacts && country.independent) {
    return null;
  }

  return (
    <div className={className}>
      {hasFacts ? (
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
      {country.kind === "independent" ? null : (
        <p className="flagStatusNote">
          {country.kind === "territory"
            ? "Territorium. Ikke en selvstendig stat"
            : "Ikke en selvstendig stat"}
          {country.partOf ? `. Del av ${country.partOf}.` : "."}
        </p>
      )}
    </div>
  );
}
