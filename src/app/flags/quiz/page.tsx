import Link from "next/link";

import { FlagQuiz } from "@/components/flag-quiz";
import { getCountries } from "@/lib/countries";
import { getStudiedFlagCodes } from "@/lib/data";
import { parseFlagQuizCount, parseFlagQuizSource } from "@/lib/flag-quiz";

type FlagQuizPageProps = {
  searchParams: Promise<{
    count?: string | string[];
    source?: string | string[];
  }>;
};

function firstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FlagQuizPage({ searchParams }: FlagQuizPageProps) {
  const params = await searchParams;
  const questionCount = parseFlagQuizCount(firstSearchParam(params.count));
  const source = parseFlagQuizSource(firstSearchParam(params.source));
  const [countries, studiedCodes] = await Promise.all([
    getCountries(),
    getStudiedFlagCodes(),
  ]);
  const studiedCodeSet = new Set(studiedCodes);
  const studiedCountries = countries.filter((country) =>
    studiedCodeSet.has(country.code),
  );
  const pool = source === "all" ? countries : studiedCountries;

  return (
    <main className="shell flagsQuizShell">
      <header className="issueBoardToolbar">
        <div>
          <Link href="/flags" className="recipeBackLink">
            <span aria-hidden="true">←</span>
            Tilbake til flagg
          </Link>
          <h1>Quiz</h1>
        </div>
      </header>

      {pool.length === 0 ? (
        <p className="flagBrowserEmpty">
          {source === "all"
            ? "Ingen flagg er tilgjengelige for quizen."
            : "Marker minst ett flagg som studert for å starte quizen."}
        </p>
      ) : (
        <FlagQuiz
          key={`${source}-${questionCount}`}
          studiedCountries={studiedCountries}
          countries={countries}
          questionCount={questionCount}
          source={source}
        />
      )}
    </main>
  );
}
