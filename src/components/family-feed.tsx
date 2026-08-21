import { eventCategoryLabel } from "@/lib/event-categories";
import type { RecentActivity } from "@/lib/family-feed";
import type { RecurringEvent } from "@/lib/types";

type FamilyFeedProps = {
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
    return <p className="feedEmpty">Ingen aktiviteter 🎉</p>;
  }

  return (
    <ul className="feedList">
      {events.map((event) => {
        const timeRange = [event.time, event.endTime].filter(Boolean).join("–");
        const meta = [event.familyMember, timeRange, eventCategoryLabel(event.category)]
          .filter(Boolean)
          .join(" · ");

        return (
          <li key={event.id} className="feedItem">
            <strong>{event.title}</strong>
            {meta ? <span className="itemMeta">{meta}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

export function FamilyFeed({ todayEvents, tomorrowEvents, activity }: FamilyFeedProps) {
  return (
    <div className="familyFeed" aria-label="Familieoversikt">
      <section className="feedCard">
        <h2 className="feedTitle">I dag</h2>
        <EventList events={todayEvents} />
      </section>

      <section className="feedCard">
        <h2 className="feedTitle">I morgen</h2>
        <EventList events={tomorrowEvents} />
      </section>

      <section className="feedCard">
        <h2 className="feedTitle">Nytt i familien</h2>
        {activity.length === 0 ? (
          <p className="feedEmpty">Ingenting nytt akkurat nå.</p>
        ) : (
          <ul className="feedList">
            {activity.map((item) => (
              <li key={`${item.type}-${item.id}`} className="feedItem">
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
      </section>
    </div>
  );
}
