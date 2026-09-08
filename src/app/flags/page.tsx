import { FlagBrowser } from "@/components/flag-browser";
import { FlagMedia } from "@/components/flag-media";
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
        <section className="flagHero" aria-labelledby="daily-flag-title">
          <span className="kicker">Dagens flagg</span>
          <h2 id="daily-flag-title">{dailyCountry.name}</h2>
          <FlagMedia country={dailyCountry} featured />
        </section>
      ) : null}

      <FlagBrowser countries={countries} />
    </main>
  );
}
