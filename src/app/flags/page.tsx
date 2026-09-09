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
          {dailyCountry.capital || dailyCountry.continent ? (
            <dl className="flagCardFacts flagHeroFacts">
              {dailyCountry.capital ? (
                <div>
                  <dt>Hovedstad</dt>
                  <dd>{dailyCountry.capital}</dd>
                </div>
              ) : null}
              {dailyCountry.continent ? (
                <div>
                  <dt>Kontinent</dt>
                  <dd>{dailyCountry.continent}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          <FlagMedia country={dailyCountry} featured />
        </section>
      ) : null}

      <FlagBrowser countries={countries} />
    </main>
  );
}
