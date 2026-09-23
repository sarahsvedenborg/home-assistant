import Link from "next/link";

import { MessageWidget } from "@/components/message-widget";
import { ShoppingWidget } from "@/components/shopping-widget";
import { formatBirthdayNames } from "@/lib/birthdays";
import type { DashboardEvent, RecentActivity } from "@/lib/family-feed";
import { describeWeather } from "@/lib/weather";
import type {
  DailyQuote,
  ShoppingListEntry,
  ShortMessage,
  Weather,
} from "@/lib/types";

type FamilyDashboardProps = {
  dateLabel: string;
  dailyQuote: DailyQuote;
  todaysBirthdays: Array<{ name: string }>;
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

const EVENT_GROUPS = [
  {
    id: "skole",
    title: "Skole",
    match: (event: DashboardEvent) =>
      event.source === "recurring" && event.category === "skole",
  },
  {
    id: "fritid",
    title: "Faste aktiviteter",
    match: (event: DashboardEvent) =>
      event.source === "recurring" && event.category === "fritid",
  },
  {
    id: "annet",
    title: "Annet",
    match: (event: DashboardEvent) => event.source === "single",
  },
] as const;

function singleEventToneClass(event: DashboardEvent) {
  const classes = ["calendarEvent", "calendarEventSingle"];

  if (event.category === "filmkveld") {
    classes.push("calendarEventMovieNight");
  } else if (event.category === "spillkveld") {
    classes.push("calendarEventGameNight");
  } else if (event.category === "ak") {
    classes.push("calendarEventAkTime");
  }

  return classes.join(" ");
}

function singleEventIcon(event: DashboardEvent) {
  if (event.category === "ak") {
    return "✨";
  }

  if (event.category === "filmkveld") {
    return "🎬";
  }

  if (event.category === "spillkveld") {
    return "🎲";
  }

  return null;
}

function SingleEventCard({ event }: { event: DashboardEvent }) {
  const timeRange = event.allDay
    ? "Hele dagen"
    : [event.time, event.endTime].filter(Boolean).join("–") || null;
  const icon = singleEventIcon(event);
  const isAkTime = event.category === "ak";
  const className = event.note
    ? `${singleEventToneClass(event)} calendarEventInteractive`
    : singleEventToneClass(event);
  const content = (
    <>
      {timeRange ? <span className="calendarEventTime">{timeRange}</span> : null}
      <strong className={icon ? "calendarSpecialEventTitle" : undefined}>
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        {event.title}
      </strong>
      {isAkTime ? (
        <span className="calendarSpecialEventDescription">
          Storesøstertid med foreldrene
        </span>
      ) : null}
      {event.familyMember ? (
        <span className="calendarEventMeta">{event.familyMember}</span>
      ) : null}
      {event.note ? (
        <span className="calendarEventDetailsIndicator" aria-hidden="true">
          ⓘ
        </span>
      ) : null}
    </>
  );

  if (event.note) {
    return (
      <Link
        href={`/kalender?event=${encodeURIComponent(event.id)}`}
        className={className}
        aria-label={`Vis all informasjon om ${event.title}`}
      >
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}

function EventList({ events }: { events: DashboardEvent[] }) {
  const groups = EVENT_GROUPS.map((group) => ({
    ...group,
    events: events.filter(group.match),
  })).filter((group) => group.events.length > 0);

  if (groups.length === 0) {
    return <p className="widgetEmpty">Ingen aktiviteter 🎉</p>;
  }

  return (
    <div className="eventWidgetGroups">
      {groups.map((group) => (
        <section className="eventWidgetGroup" key={group.id} aria-label={group.title}>
          <h3 className="eventWidgetGroupTitle">{group.title}</h3>
          {group.id === "annet" ? (
            <div className="eventWidgetCards">
              {group.events.map((event) => (
                <SingleEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <ul className="widgetList eventWidgetList">
              {group.events.map((event) => {
                const timeRange = event.allDay
                  ? "Hele dagen"
                  : [event.time, event.endTime].filter(Boolean).join("–");
                const meta = [event.familyMember, timeRange].filter(Boolean).join(" · ");

                return (
                  <li key={event.id} className="widgetItem">
                    <strong>{event.title}</strong>
                    {meta ? (
                      <span className="itemMeta eventWidgetMeta">{meta}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
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
  dailyQuote,
  todaysBirthdays,
  todayEvents,
  tomorrowEvents,
  activity,
  messages,
  shoppingItems,
  familyMembers,
  weather,
}: FamilyDashboardProps) {
  const birthdayNames = formatBirthdayNames(
    todaysBirthdays.map((birthday) => birthday.name),
  );

  return (
    <section className="dashboard" aria-label="Familieoversikt">
      <article className="widget wGreet accentWarm">
        <div className="dashboardGreeting">
          <h1 className="dashboardTitle">{dateLabel}</h1>
        </div>

        <figure className="dailyQuote dailyQuoteQuote">
          <blockquote>“{dailyQuote.text}”</blockquote>
          <figcaption>— {dailyQuote.author}</figcaption>
        </figure>
        <figure className="dailyQuote dailyQuoteBirthday">
          <p>
            <span aria-hidden="true">🎉</span>
            <span>
              Gratulerer med dagen
              {birthdayNames ? (
                <>
                  <br />
                  {birthdayNames}!
                </>
              ) : (
                "!"
              )}
            </span>
          </p>
        </figure>
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
                {item.type === "shopping" ? (
                  <span className="itemMeta">lagt til i handlelisten</span>
                ) : item.person ? (
                  <span className="itemMeta">{item.person} ønsket seg</span>
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

      <ShoppingWidget items={shoppingItems} />

      <MessageWidget messages={messages} familyMembers={familyMembers} />
    </section>
  );
}
