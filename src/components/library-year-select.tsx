"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LibraryYearSelectProps = {
  years: number[];
  selectedYear: number;
};

export function LibraryYearSelect({ years, selectedYear }: LibraryYearSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="libraryYear">
      <span className="srOnly">Vis ferdige bøker fra år</span>
      <select
        value={String(selectedYear)}
        onChange={(event) => {
          const next = new URLSearchParams(searchParams.toString());
          next.set("year", event.target.value);
          const query = next.toString();
          router.push(query ? `${pathname}?${query}` : pathname);
        }}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
}
