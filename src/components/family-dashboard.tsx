import Link from "next/link";

import { MessageWidget } from "@/components/message-widget";
import { ShoppingWidget } from "@/components/shopping-widget";
import type { DashboardEvent, RecentActivity } from "@/lib/family-feed";
import { describeWeather } from "@/lib/weather";
import type { ShoppingListEntry, ShortMessage, Weather } from "@/lib/types";

type FamilyDashboardProps = {
  dateLabel: string;
  todayEvents: DashboardEvent[];
  tomorrowEvents: DashboardEvent[];
  activity: RecentActivity[];
  messages: ShortMessage[];
  shoppingItems: ShoppingListEntry[];
  familyMembers: string[];
  weather: Weather | null;
};

const ACTIVITY_ICON: Record<RecentActivity["type"], string> = {
  wish: "🎁",
  shopping: "🛒",
};

const ACTIVITY_VERB: Record<RecentActivity["type"], string> = {
  wish: "ønsket seg",
  shopping: "la til",
};

function EventList({ events }: { events: DashboardEvent[] }) {
  if (events.length === 0) {
    return <p className="widgetEmpty">Ingen aktiviteter 🎉</p>;
  }

  return (
    <ul className="widgetList">
      {events.map((event) => {
        const timeRange = event.allDay
          ? "Hele dagen"
          : [event.time, event.endTime].filter(Boolean).join("–");
        const meta = [event.familyMember, timeRange, event.categoryLabel]
          .filter(Boolean)
          .join(" · ");

        return (
          <li key={event.id} className="widgetItem">
            <strong>{event.title}</strong>
            {meta ? <span className="itemMeta">{meta}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

// Placeholder card used when live weather data is unavailable.
function ComingSoonWidget({
  areaClass,
  accentClass,
  icon,
  title,
  description,
}: {
  areaClass: string;
  accentClass: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className={`widget widgetMuted ${areaClass} ${accentClass}`}>
      <div className="widgetHead">
        <h2 className="widgetTitle">
          <span aria-hidden="true">{icon}</span> {title}
        </h2>
        <span className="widgetBadge">Kommer snart</span>
      </div>
      <p className="widgetEmpty">{description}</p>
    </article>
  );
}

function WeatherWidget({ weather }: { weather: Weather }) {
  const { emoji, label } = describeWeather(weather.symbolCode);

  return (
    <article className="widget wWeather accentCool">
      <div className="widgetHead">
        <h2 className="widgetTitle">Været</h2>
        <span className="itemMeta">Kløfta</span>
      </div>
      <div className="weatherNow">
        <span className="weatherEmoji" aria-hidden="true">
          {emoji}
        </span>
        <div className="weatherReadout">
          <strong className="weatherTemp">{weather.temperature}°</strong>
          <span className="itemMeta">{label}</span>
        </div>
      </div>
      <span className="itemMeta">
        Høy {weather.high}° · Lav {weather.low}°
      </span>
    </article>
  );
}

export function FamilyDashboard({
  dateLabel,
  todayEvents,
  tomorrowEvents,
  activity,
  messages,
  shoppingItems,
  familyMembers,
  weather,
}: FamilyDashboardProps) {
  return (
    <section className="dashboard" aria-label="Familieoversikt">
      <article className="widget wGreet accentWarm">
      {/*   <span className="itemMeta">{dateLabel}</span> */}
     {/*    <span className="kicker">{dateLabel}</span> */}
        <h1 className="dashboardTitle">Dagens oversikt</h1>
         <span className="itemMeta">{dateLabel}</span> 
      {/*   <div className="heroActions">
          <Link className="buttonPrimary" href="/onskeliste#add-wish">
            Legg til et ønske
          </Link>
          <Link className="buttonSecondary" href="/movies#add-movie">
            Legg til en film
          </Link>
        </div> */}
      </article>

      <article className="widget wToday accentFuture">
        <div className="widgetHead">
          <h2 className="widgetTitle">I dag</h2>
        </div>
        <EventList events={todayEvents} />
      </article>

      <article className="widget wTomorrow accentFuture">
        <div className="widgetHead">
          <h2 className="widgetTitle">I morgen</h2>
        </div>
        <EventList events={tomorrowEvents} />
      </article>

      <article className="widget wNews">
        <div className="widgetHead">
          <h2 className="widgetTitle">Nytt i familien</h2>
        </div>
        {activity.length === 0 ? (
          <p className="widgetEmpty">Ingenting nytt akkurat nå.</p>
        ) : (
          <ul className="widgetList">
            {activity.map((item) => (
              <li key={`${item.type}-${item.id}`} className="widgetItem">
                <strong>
                  <span aria-hidden="true">{ACTIVITY_ICON[item.type]}</span> {item.title}
                </strong>
                {item.person ? (
                  <span className="itemMeta">
                    {item.person} {ACTIVITY_VERB[item.type]}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </article>

      {weather ? (
        <WeatherWidget weather={weather} />
      ) : (
        <ComingSoonWidget
          areaClass="wWeather"
          accentClass="accentCool"
          icon="⛅"
          title="Været"
          description="Værmelding for dagen dukker opp her."
        />
      )}

      <ShoppingWidget items={shoppingItems} familyMembers={familyMembers} />

      <MessageWidget messages={messages} familyMembers={familyMembers} />
    </section>
  );
}
