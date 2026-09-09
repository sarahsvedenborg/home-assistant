import Link from "next/link";

import { FlagQuiz } from "@/components/flag-quiz";
import { getCountries } from "@/lib/countries";
import { getStudiedFlagCodes } from "@/lib/data";

export default async function FlagQuizPage() {
  const [countries, studiedCodes] = await Promise.all([
    getCountries(),
    getStudiedFlagCodes(),
  ]);
  const studiedCodeSet = new Set(studiedCodes);
  const studiedCountries = countries.filter((country) =>
    studiedCodeSet.has(country.code),
  );

  return (
    <main className="shell">
      <header className="issueBoardToolbar">
        <div>
          <Link href="/flags" className="recipeBackLink">
            <span aria-hidden="true">←</span>
            Tilbake til flagg
          </Link>
          <h1>Quiz</h1>
        </div>
      </header>

      {studiedCountries.length === 0 ? (
        <p className="flagBrowserEmpty">
          Marker minst ett flagg som studert for å starte quizen.
        </p>
      ) : (
        <FlagQuiz studiedCountries={studiedCountries} countries={countries} />
      )}
    </main>
  );
}
