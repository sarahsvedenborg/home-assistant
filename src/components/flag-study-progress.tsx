"use client";

import type { Country } from "@/lib/types";

export function FlagStudyProgress({
  countries,
  studiedCodes,
}: {
  countries: Country[];
  studiedCodes: Set<string>;
}) {
  const totalCount = countries.length;
  const studiedCount = countries.filter((country) =>
    studiedCodes.has(country.code),
  ).length;
  const percent =
    totalCount === 0 ? 0 : Math.round((studiedCount / totalCount) * 100);
  const label = `${studiedCount} av ${totalCount} flagg studert`;

  return (
    <section className="flagStudyProgress" aria-label={label}>
      <div className="flagStudyProgressCopy">
        <p>{label}</p>
        <span>{percent}%</span>
      </div>
      <div
        className="flagStudyProgressBar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalCount}
        aria-valuenow={studiedCount}
        aria-hidden="true"
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </section>
  );
}
