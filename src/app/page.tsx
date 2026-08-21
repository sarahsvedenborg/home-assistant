import { FamilyDashboard } from "@/components/family-dashboard";
import { HubCard } from "@/components/hub-card";
import { SiteHeader } from "@/components/site-header";
import { getMovieRecommendations, getRecipes, getRecurringEvents, getShoppingList, getWishListItems } from "@/lib/data";
import { buildRecentActivity, eventsForDate } from "@/lib/family-feed";

// "fredag 21. august" -> "Fredag 21. august" (Oslo local, Norwegian).
function formatOsloDateLabel(date: Date): string {
  const label = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default async function Home() {
  const [movies, recipes, recurringEvents, shoppingList, wishListItems] =
    await Promise.all([
      getMovieRecommendations(),
      getRecipes(),
      getRecurringEvents(),
      getShoppingList(),
      getWishListItems(),
    ]);

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const todayEvents = eventsForDate(recurringEvents, now);
  const tomorrowEvents = eventsForDate(recurringEvents, tomorrow);
  const activity = buildRecentActivity(wishListItems, shoppingList.items, { now });
  return (
    <main className="shell">
      <SiteHeader current="home" />

      <FamilyDashboard
        dateLabel={formatOsloDateLabel(now)}
        todayEvents={todayEvents}
        tomorrowEvents={tomorrowEvents}
        activity={activity}
      />

      <section className="hubGrid" aria-label="Hovedseksjoner">
        <HubCard
          href="/onskeliste"
          formHref="/onskeliste#add-wish"
          icon="🎁"
          title="Ønskeliste"
          description="Samling av gaveønsker per familiemedlem."
          stat={`${wishListItems.length} idéer`}
          accentClass="accentWarm"
          openLabel="Åpne ønskelisten"
          addLabel="Legg til ønske"
        />
        <HubCard
          href="/handleliste"
          formHref="/handleliste#add-item"
          icon="🛒"
          title="Handleliste"
          description="Varer vi trenger å kjøpe."
          stat={`${shoppingList.items.filter((item) => !item.checked).length} varer`}
          accentClass="accentFuture"
          openLabel="Åpne handlelisten"
          addLabel="Legg til vare"
        />
        <HubCard
          href="/oppskrifter"
          formHref="/oppskrifter#add-recipe"
          icon="🍲"
          title="Oppskrifter"
          description="Samling av oppskrifter med lenker og notater."
          stat={`${recipes.length} oppskrifter`}
          accentClass="accentCool"
          openLabel="Se oppskrifter"
          addLabel="Legg til oppskrift"
        />
        <HubCard
          href="/movies"
          formHref="/movies#add-movie"
          icon="🎬"
          title="Filmer"
          description="Oversikt over filmforlag og hva som er sett og ikke."
          stat={`${movies.filter((movie) => !movie.watched).length} usett`}
          accentClass="accentCool"
          openLabel="Se filmer"
          addLabel="Legg til film"
        />
        <article className="hubCard accentFuture">
          <div className="hubCardTop">
            <span className="hubIcon" aria-hidden="true">
              🌟
            </span>
            <span className="hubStat">kommer snart</span>
          </div>
          <h2>Flere familieområder</h2>
          <p>Her kan turer, middagstips, kalendere og andre enkle kategorier komme senere.</p>
          <span className="buttonSecondary buttonMuted">Klar for fase to</span>
        </article>
      </section>

  {/*     <section className="infoStrip">
        <div>
          <span className="kicker">Trygt fra start</span>
          <h2>Ingen komplisert innlogging for barna</h2>
        </div>
        <p>
          Barn sender inn forslag gjennom enkle skjemaer. Voksne beholder redigeringsrettigheter i
          Sanity Studio.
        </p>
      </section> */}
    </main>
  );
}
