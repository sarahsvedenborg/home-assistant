import { AddButton } from "@/components/add-button";
import { FamilyCalendar } from "@/components/family-calendar";
import { FamilyDashboard } from "@/components/family-dashboard";
import { HomeViewSwitcher } from "@/components/home-view-switcher";
import { HomeWelcome } from "@/components/home-welcome";
import { HubCard } from "@/components/hub-card";
import { SingleEventForm } from "@/components/single-event-form";
import { getFamilyMembers, getMovieRecommendations, getRecipes, getRecurringEvents, getShoppingList, getSingleEvents, getWeather, getWishListItems } from "@/lib/data";
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

type HomePageProps = {
  searchParams: Promise<{
    view?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const [
    familyMembers,
    movies,
    recipes,
    recurringEvents,
    singleEvents,
    shoppingList,
    wishListItems,
    weather,
  ] = await Promise.all([
    getFamilyMembers(),
    getMovieRecommendations(),
    getRecipes(),
    getRecurringEvents(),
    getSingleEvents(),
    getShoppingList(),
    getWishListItems(),
    getWeather(),
  ]);

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const todayEvents = eventsForDate(recurringEvents, singleEvents, now);
  const tomorrowEvents = eventsForDate(recurringEvents, singleEvents, tomorrow);
  const activity = buildRecentActivity(wishListItems, shoppingList.items, { now });
  const requestedView = (await searchParams).view;
  const initialView =
    (Array.isArray(requestedView) ? requestedView[0] : requestedView) === "calendar"
      ? "calendar"
      : "dashboard";

  return (
    <main className="shell homeShell">
      <HomeWelcome dateLabel={formatOsloDateLabel(now)} />

      <HomeViewSwitcher
        initialView={initialView}
        dashboard={
          <>
            <FamilyDashboard
              todayEvents={todayEvents}
              tomorrowEvents={tomorrowEvents}
              activity={activity}
              weather={weather}
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
              <HubCard
                href="/kalender"
                formHref="/#add-event"
                icon="📅"
                title="Kalender"
                description="Se avtaler og faste aktiviteter i uke- eller månedsvisning."
                stat={`${singleEvents.length + recurringEvents.length} hendelser`}
                accentClass="accentFuture"
                openLabel="Åpne kalenderen"
                addLabel="Legg til hendelse"
              />
            </section>
          </>
        }
        calendar={
          <FamilyCalendar
            recurringEvents={recurringEvents}
            singleEvents={singleEvents}
            todayDateKey={osloDateKey(now)}
          />
        }
      />

      <AddButton title="Legg til hendelse" label="Ny hendelse" anchor="add-event">
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
