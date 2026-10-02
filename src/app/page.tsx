import { AddButton } from "@/components/add-button";
import { FamilyDashboard } from "@/components/family-dashboard";
import { HubCard } from "@/components/hub-card";
import { SingleEventForm } from "@/components/single-event-form";
import { getDailyQuote } from "@/lib/daily-quote";
import { getFamilyMembers, getMovieRecommendations, getRecipes, getRecurringEvents, getShoppingList, getShortMessages, getSingleEvents, getStudiedFlagCodes, getTodaysBirthdays, getWeather, getWishListItems } from "@/lib/data";
import { buildRecentActivity, eventsForDate, osloDateKey } from "@/lib/family-feed";

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
  const now = new Date();
  const todayDateKey = osloDateKey(now);
  const [
    dailyQuote,
    familyMembers,
    messages,
    movies,
    recipes,
    recurringEvents,
    singleEvents,
    shoppingList,
    studiedFlagCodes,
    todaysBirthdays,
    wishListItems,
    weather,
  ] = await Promise.all([
    getDailyQuote(todayDateKey),
    getFamilyMembers(),
    getShortMessages(),
    getMovieRecommendations(),
    getRecipes(),
    getRecurringEvents(),
    getSingleEvents(),
    getShoppingList(),
    getStudiedFlagCodes(),
    getTodaysBirthdays(),
    getWishListItems(),
    getWeather(),
  ]);

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const todayEvents = eventsForDate(recurringEvents, singleEvents, now);
  const tomorrowEvents = eventsForDate(recurringEvents, singleEvents, tomorrow);
  const activity = buildRecentActivity(wishListItems, shoppingList.items, { now });
  return (
    <main className="shell homeShell">
      <section className="homeViews" aria-label="Dashboard">
        <div className="homeDashboardPanel" role="region" aria-label="Dashboard">
            <FamilyDashboard
              dateLabel={formatOsloDateLabel(now)}
              dailyQuote={dailyQuote}
              todaysBirthdays={todaysBirthdays}
              todayEvents={todayEvents}
              tomorrowEvents={tomorrowEvents}
              activity={activity}
              messages={messages}
              shoppingItems={shoppingList.items}
              familyMembers={familyMembers.map((member) => member.name)}
              weather={weather}
            />

            <section className="hubGrid" aria-label="Hovedseksjoner">
              <HubCard
                href="/flags"
                formHref="/flags/quiz"
                icon="🌍"
                title="Lær flagg"
                stat={
                  studiedFlagCodes.length === 1
                    ? "1 land lært"
                    : `${studiedFlagCodes.length} land lært`
                }
                accentClass="accentFuture hubCardLearn"
                openLabel="Dagens flagg"
                addLabel="Start quiz"
              />
              <HubCard
                href="/onskeliste"
                formHref="/onskeliste#add-wish"
                icon="🎁"
                title="Ønskeliste"
                stat={`${wishListItems.length} idéer`}
                accentClass="accentWarm"
                openLabel="Åpne ønskelisten"
                addLabel="Legg til ønske"
              />
              <HubCard
                href="/oppskrifter"
                formHref="/oppskrifter#add-recipe"
                icon="🍲"
                title="Oppskrifter"
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
                stat={`${movies.filter((movie) => !movie.watched).length} usett`}
                accentClass="accentCool"
                openLabel="Se filmer"
                addLabel="Legg til film"
              />
              <HubCard
                href="/boker"
                formHref="/boker#add-book"
                icon="📚"
                title="Bøker"
                accentClass="accentWarm"
                openLabel="Se bøker"
                addLabel="Legg til bok"
              />
            {/*   <HubCard
                href="/kalender"
                formHref="/#add-event"
                icon="📅"
                title="Kalender"
                stat={`${singleEvents.length + recurringEvents.length} hendelser`}
                accentClass="accentFuture"
                openLabel="Åpne kalenderen"
                addLabel="Legg til hendelse"
              /> */}
            </section>
        </div>
      </section>

      <AddButton
        title="Legg til hendelse"
        label="Ny hendelse"
        anchor="add-event"
        hideTriggerOnMobile
        wide
        modalClassName="formModalEvents"
      >
        <SingleEventForm familyMembers={familyMembers.map((member) => member.name)} />
      </AddButton>

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
