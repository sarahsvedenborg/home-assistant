import { AddButton } from "@/components/add-button";
import { RecurringEventForm } from "@/components/recurring-event-form";
import { SiteHeader } from "@/components/site-header";
import { getFamilyMembers, getRecurringEvents } from "@/lib/data";
import { eventCategoryLabel } from "@/lib/event-categories";
import type { RecurringEvent } from "@/lib/types";
import { WEEKDAYS } from "@/lib/weekdays";

// ISO datetime -> "DD.MM.YYYY" (date portion only, no timezone shift).
function formatDate(iso?: string): string | null {
  if (!iso) {
    return null;
  }

  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) {
    return null;
  }

  return `${day}.${month}.${year}`;
}

function formatDateRange(startDate?: string, endDate?: string): string | null {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) {
    return `${start}–${end}`;
  }

  if (start) {
    return `Fra ${start}`;
  }

  if (end) {
    return `Til ${end}`;
  }

  return null;
}

export default async function AktiviteterPage() {
  const [familyMembers, events] = await Promise.all([
    getFamilyMembers(),
    getRecurringEvents(),
  ]);

  // Group by weekday and keep the days in Monday-to-Sunday order.
  const grouped = WEEKDAYS.map((day) => ({
    day,
    events: events
      .filter((event) => event.dayOfWeek === day.value)
      .sort((left, right) => (left.time || "").localeCompare(right.time || "")),
  })).filter((group) => group.events.length > 0);

  return (
    <main className="shell">
      <SiteHeader current="aktiviteter" />

      <section className="sectionHero accentFuture">
        <div>
          <span className="kicker">Ukeplan</span>
          <h1 style={{ margin: "0.25em 0" }}>Faste aktiviteter</h1>
        </div>
        <div className="sectionBadge">{events.length} aktiviteter</div>
      </section>

      <section className="listStack">
        <div className="listPanel">
          <div className="panelHeading">
            <h2>Ukeplan</h2>
          </div>

          {events.length === 0 ? (
            <div className="emptyState">
              <span className="emptyIcon" aria-hidden="true">
                📅
              </span>
              <h3>Ingen faste aktiviteter enda</h3>
              <p>Legg til den første aktiviteten i skjemaet.</p>
            </div>
          ) : (
            <div className="groupStack">
              {grouped.map((group) => (
                <section key={group.day.value} className="groupCard groupCardOpen">
                  <div className="groupHeader">
                    <h3>{group.day.label}</h3>
                    <span>
                      {group.events.length} aktivitet{group.events.length === 1 ? "" : "er"}
                    </span>
                  </div>

                  <ul className="itemList">
                    {group.events.map((event: RecurringEvent) => {
                      const timeRange = [event.time, event.endTime].filter(Boolean).join("–");
                      const meta = [event.familyMember, timeRange, eventCategoryLabel(event.category)]
                        .filter(Boolean)
                        .join(" · ");

                      return (
                        <li key={event.id} className="itemCard">
                          <div className="itemTitleRow">
                            <strong>{event.title}</strong>
                            <span className="itemMeta">{meta}</span>
                          </div>
                          {formatDateRange(event.startDate, event.endDate) ? (
                            <span className="itemMeta">
                              {formatDateRange(event.startDate, event.endDate)}
                            </span>
                          ) : null}
                          {event.whatToBring ? <p>Ta med: {event.whatToBring}</p> : null}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>

      <AddButton title="Legg til fast aktivitet" label="Ny aktivitet">
        <RecurringEventForm familyMembers={familyMembers.map((member) => member.name)} />
      </AddButton>
    </main>
  );
}
