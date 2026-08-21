import Link from "next/link";

import { eventCategoryLabel } from "@/lib/event-categories";
import type { RecentActivity } from "@/lib/family-feed";
import type { RecurringEvent } from "@/lib/types";

type FamilyDashboardProps = {
  dateLabel: string;
  todayEvents: RecurringEvent[];
  tomorrowEvents: RecurringEvent[];
  activity: RecentActivity[];
};

const ACTIVITY_ICON: Record<RecentActivity["type"], string> = {
  wish: "🎁",
  shopping: "🛒",
};

const ACTIVITY_VERB: Record<RecentActivity["type"], string> = {
  wish: "ønsket seg",
  shopping: "la til",
};

function EventList({ events }: { events: RecurringEvent[] }) {
  if (events.length === 0) {
    return <p className="widgetEmpty">Ingen aktiviteter 🎉</p>;
  }

  return (
    <ul className="widgetList">
      {events.map((event) => {
        const timeRange = [event.time, event.endTime].filter(Boolean).join("–");
        const meta = [event.familyMember, timeRange, eventCategoryLabel(event.category)]
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

// Placeholder card for a feature that is planned but not built yet (weather,
// dinner plan, messages). Keeps the dashboard layout complete and signals
// what is coming.
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

export function FamilyDashboard({
  dateLabel,
  todayEvents,
  tomorrowEvents,
  activity,
}: FamilyDashboardProps) {
  return (
    <section className="dashboard" aria-label="Familieoversikt">
      <article className="widget wGreet accentWarm">
        <span className="kicker">Velkommen hjem</span>
        <h1 className="dashboardTitle">Dagens oversikt</h1>
        <span className="itemMeta">{dateLabel}</span>
        <div className="heroActions">
          <Link className="buttonPrimary" href="/onskeliste#add-wish">
            Legg til et ønske
          </Link>
          <Link className="buttonSecondary" href="/movies#add-movie">
            Legg til en film
          </Link>
        </div>
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

      <ComingSoonWidget
        areaClass="wWeather"
        accentClass="accentCool"
        icon="⛅"
        title="Været"
        description="Værmelding for dagen dukker opp her."
      />

      <ComingSoonWidget
        areaClass="wDinner"
        accentClass="accentWarm"
        icon="🍽️"
        title="Dagens middag"
        description="Her kan vi planlegge hva vi spiser i uka."
      />

      <ComingSoonWidget
        areaClass="wMessages"
        accentClass="accentCool"
        icon="💬"
        title="Meldinger"
        description="Små beskjeder til familien samles her."
      />
    </section>
  );
}
