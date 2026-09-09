import { FeaturedFlag } from "@/components/featured-flag";
import { FlagBrowser } from "@/components/flag-browser";
import { getCountries, getDailyCountry } from "@/lib/countries";
import { osloDateKey } from "@/lib/family-feed";

export default async function FlagsPage() {
  const countries = await getCountries();
  const dailyCountry = getDailyCountry(countries, osloDateKey(new Date()));

  return (
    <main className="shell">
      <header className="issueBoardToolbar">
        <div>
          <h1>Flagg</h1>
        </div>
      </header>

      {dailyCountry ? (
        <FeaturedFlag countries={countries} initialCode={dailyCountry.code} />
      ) : null}

      <FlagBrowser countries={countries} />
    </main>
  );
}
