import { AddButton } from "@/components/add-button";
import { FamilyCalendar } from "@/components/family-calendar";
import { FamilyDashboard } from "@/components/family-dashboard";
import { HomeViewTabs } from "@/components/home-view-tabs";
import { HubCard } from "@/components/hub-card";
import { IssueBoard } from "@/components/issue-board";
import { SingleEventForm } from "@/components/single-event-form";
import { getBoardIssues, getFamilyMembers, getMovieRecommendations, getRecipes, getRecurringEvents, getShoppingList, getShortMessages, getSingleEvents, getWeather, getWishListItems } from "@/lib/data";
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
  const [
    boardIssues,
    familyMembers,
    messages,
    movies,
    recipes,
    recurringEvents,
    singleEvents,
    shoppingList,
    wishListItems,
    weather,
  ] = await Promise.all([
    getBoardIssues(),
    getFamilyMembers(),
    getShortMessages(),
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
  return (
    <main className="shell homeShell">
      <HomeViewTabs
        dashboard={
          <>
            <FamilyDashboard
              dateLabel={formatOsloDateLabel(now)}
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
          </>
        }
        calendar={
          <FamilyCalendar
            recurringEvents={recurringEvents}
            singleEvents={singleEvents}
            todayDateKey={osloDateKey(now)}
          />
        }
        board={
          <IssueBoard
            initialIssues={boardIssues}
            familyMembers={familyMembers.map((member) => member.name)}
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
