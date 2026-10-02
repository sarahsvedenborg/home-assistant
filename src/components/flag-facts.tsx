import type { Country } from "@/lib/types";

export function FlagFacts({
  country,
  className,
  includeFacts = true,
  includeStatus = true,
}: {
  country: Country;
  className?: string;
  includeFacts?: boolean;
  includeStatus?: boolean;
}) {
  const hasFacts = includeFacts && Boolean(country.capital || country.continent);
  const showStatus = includeStatus && country.kind !== "independent";

  if (!hasFacts && !showStatus) {
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
      {showStatus ? (
        <p className="flagStatusNote">
          {country.kind === "territory"
            ? "Territorium. Ikke en selvstendig stat"
            : "Ikke en selvstendig stat"}
          {country.partOf ? `. Del av ${country.partOf}.` : "."}
        </p>
      ) : null}
    </div>
  );
}
