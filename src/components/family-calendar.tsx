"use client";

import { useMemo, useState } from "react";

import { eventsForDateRange, type CalendarDay, type DashboardEvent } from "@/lib/family-feed";
import type { RecurringEvent, SingleEvent } from "@/lib/types";

type CalendarView = "week" | "month";

type FamilyCalendarProps = {
  recurringEvents: RecurringEvent[];
  singleEvents: SingleEvent[];
  todayDateKey: string;
};

const WEEKDAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function dateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00Z`);
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfWeek(date: Date): Date {
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  return addDays(date, -mondayOffset);
}

function monthGridStart(date: Date): Date {
  return startOfWeek(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)));
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("nb-NO", { ...options, timeZone: "UTC" }).format(date);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function periodTitle(view: CalendarView, anchor: Date, days: CalendarDay[]): string {
  if (view === "month") {
    return capitalize(formatDate(anchor, { month: "long", year: "numeric" }));
  }

  const start = dateFromKey(days[0]?.dateKey ?? dateKey(anchor));
  const end = dateFromKey(days.at(-1)?.dateKey ?? dateKey(anchor));
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();

  if (sameMonth) {
    return `${start.getUTCDate()}.–${formatDate(end, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;
  }

  return `${formatDate(start, {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  })} – ${formatDate(end, { day: "numeric", month: "short", year: "numeric" })}`;
}

function EventCard({ event }: { event: DashboardEvent }) {
  const time = event.allDay
    ? "Hele dagen"
    : [event.time, event.endTime].filter(Boolean).join("–") || null;
  const categoryClass =
    event.category === "skole"
      ? "calendarEventSchool"
      : event.category === "fritid"
        ? "calendarEventLeisure"
        : "calendarEventSingle";

  return (
    <article className={`calendarEvent ${categoryClass}`}>
      {time ? <span className="calendarEventTime">{time}</span> : null}
      <strong>{event.title}</strong>
      <span className="calendarEventMeta">
        {[event.familyMember, event.categoryLabel].filter(Boolean).join(" · ")}
      </span>
    </article>
  );
}

export function FamilyCalendar({
  recurringEvents,
  singleEvents,
  todayDateKey,
}: FamilyCalendarProps) {
  const [view, setView] = useState<CalendarView>("week");
  const [anchorDateKey, setAnchorDateKey] = useState(todayDateKey);
  const anchor = useMemo(() => dateFromKey(anchorDateKey), [anchorDateKey]);

  const { days, visibleMonth } = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(anchor);
      const end = addDays(start, 6);

      return {
        days: eventsForDateRange(
          recurringEvents,
          singleEvents,
          dateKey(start),
          dateKey(end),
        ),
        visibleMonth: anchor.getUTCMonth(),
      };
    }

    const start = monthGridStart(anchor);
    const end = addDays(start, 41);

    return {
      days: eventsForDateRange(
        recurringEvents,
        singleEvents,
        dateKey(start),
        dateKey(end),
      ),
      visibleMonth: anchor.getUTCMonth(),
    };
  }, [anchor, recurringEvents, singleEvents, view]);

  function movePeriod(direction: -1 | 1) {
    const next = new Date(anchor);

    if (view === "week") {
      next.setUTCDate(next.getUTCDate() + direction * 7);
    } else {
      next.setUTCDate(1);
      next.setUTCMonth(next.getUTCMonth() + direction);
    }

    setAnchorDateKey(dateKey(next));
  }

  function changeView(nextView: CalendarView) {
    setView(nextView);
  }

  return (
    <section className="calendarPanel" aria-labelledby="calendar-period">
      <div className="calendarToolbar">
        <div className="calendarNavigation" aria-label="Kalendernavigasjon">
          <button
            type="button"
            className="calendarIconButton"
            onClick={() => movePeriod(-1)}
            aria-label={view === "week" ? "Forrige uke" : "Forrige måned"}
          >
            ←
          </button>
          <button
            type="button"
            className="calendarTodayButton"
            onClick={() => setAnchorDateKey(todayDateKey)}
          >
            I dag
          </button>
          <button
            type="button"
            className="calendarIconButton"
            onClick={() => movePeriod(1)}
            aria-label={view === "week" ? "Neste uke" : "Neste måned"}
          >
            →
          </button>
        </div>

        <h2 id="calendar-period" aria-live="polite">
          {periodTitle(view, anchor, days)}
        </h2>

        <div className="calendarViewToggle" aria-label="Kalendervisning">
          <button
            type="button"
            className={view === "week" ? "calendarToggleActive" : undefined}
            aria-pressed={view === "week"}
            onClick={() => changeView("week")}
          >
            Uke
          </button>
          <button
            type="button"
            className={view === "month" ? "calendarToggleActive" : undefined}
            aria-pressed={view === "month"}
            onClick={() => changeView("month")}
          >
            Måned
          </button>
        </div>
      </div>

      <div className="calendarScroll">
        <div className={`calendarGrid calendarGrid${view === "week" ? "Week" : "Month"}`}>
          {WEEKDAY_LABELS.map((label) => (
            <div className="calendarWeekday" key={label}>
              {label}
            </div>
          ))}

          {days.map((day) => {
            const date = dateFromKey(day.dateKey);
            const isToday = day.dateKey === todayDateKey;
            const outsideMonth = view === "month" && date.getUTCMonth() !== visibleMonth;
            const className = [
              "calendarDay",
              isToday ? "calendarDayToday" : "",
              outsideMonth ? "calendarDayOutside" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const schoolEvents = day.events.filter((event) => event.category === "skole");
            const leisureEvents = day.events.filter((event) => event.category === "fritid");
            const otherEvents = day.events.filter(
              (event) => event.category !== "skole" && event.category !== "fritid",
            );

            return (
              <section className={className} key={day.dateKey}>
                <div className="calendarDayHeading">
                  <time dateTime={day.dateKey}>
                    {view === "week"
                      ? capitalize(formatDate(date, { day: "numeric", month: "short" }))
                      : date.getUTCDate()}
                  </time>
                  {isToday ? <span>I dag</span> : null}
                </div>

                <div className="calendarEvents">
                  {day.events.length > 0 ? (
                    <>
                      <div className="calendarEventsTop">
                        {schoolEvents.map((event) => (
                          <EventCard event={event} key={`${day.dateKey}-${event.id}`} />
                        ))}
                      </div>
                      <div className="calendarEventsBottom">
                        {otherEvents.map((event) => (
                          <EventCard event={event} key={`${day.dateKey}-${event.id}`} />
                        ))}
                        {leisureEvents.map((event) => (
                          <EventCard event={event} key={`${day.dateKey}-${event.id}`} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="calendarNoEvents">Ingen avtaler</span>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
