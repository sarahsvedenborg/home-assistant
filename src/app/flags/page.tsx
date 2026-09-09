import Link from "next/link";

import { FlagsWorkspace } from "@/components/flags-workspace";
import { getCountries, getDailyCountry } from "@/lib/countries";
import { getStudiedFlagCodes } from "@/lib/data";
import { osloDateKey } from "@/lib/family-feed";

export default async function FlagsPage() {
  const [countries, studiedCodes] = await Promise.all([
    getCountries(),
    getStudiedFlagCodes(),
  ]);
  const dailyCountry = getDailyCountry(countries, osloDateKey(new Date()));

  return (
    <main className="shell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Flagg</h1>
        </div>
        <Link href="/flags/quiz" className="buttonPrimary">
          Start quiz
        </Link>
      </header>

      {dailyCountry ? (
        <FlagsWorkspace
          countries={countries}
          initialCode={dailyCountry.code}
          studiedCodes={studiedCodes}
        />
      ) : null}
    </main>
  );
}
