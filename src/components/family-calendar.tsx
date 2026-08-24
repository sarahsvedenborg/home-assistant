"use client";

import { useMemo, useState } from "react";

import { FormModal } from "@/components/form-modal";
import { eventsForDateRange, type CalendarDay, type DashboardEvent } from "@/lib/family-feed";
import type { DayNote, RecurringEvent, SingleEvent } from "@/lib/types";

type CalendarView = "week" | "month";

type FamilyCalendarProps = {
  recurringEvents: RecurringEvent[];
  singleEvents: SingleEvent[];
  dayNotes?: DayNote[];
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

function EventCard({
  event,
  onOpen,
}: {
  event: DashboardEvent;
  onOpen: (event: DashboardEvent) => void;
}) {
  const time = event.allDay
    ? "Hele dagen"
    : [event.time, event.endTime].filter(Boolean).join("–") || null;
  const categoryClass =
    event.category === "skole"
      ? "calendarEventSchool"
      : event.category === "fritid"
        ? "calendarEventLeisure"
        : "calendarEventSingle";
  const isMovieNight =
    event.source === "single" && event.category === "filmkveld";
  const isGameNight =
    event.source === "single" && event.category === "spillkveld";
  const isAkTime = event.source === "single" && event.category === "ak";
  const movieNightClass = isMovieNight ? "calendarEventMovieNight" : "";
  const gameNightClass = isGameNight ? "calendarEventGameNight" : "";
  const akTimeClass = isAkTime ? "calendarEventAkTime" : "";
  const specialEventIcon = isAkTime
    ? "✨"
    : isMovieNight
      ? "🎬"
      : isGameNight
        ? "🎲"
        : null;

  const content = (
    <>
      {time ? <span className="calendarEventTime">{time}</span> : null}
      <strong
        className={
          specialEventIcon ? "calendarSpecialEventTitle" : undefined
        }
      >
        {specialEventIcon ? (
          <span aria-hidden="true">{specialEventIcon}</span>
        ) : null}
        {event.title}
      </strong>
      {isAkTime ? (
        <span className="calendarSpecialEventDescription">
          Storesøstertid med foreldrene
        </span>
      ) : null}
      <span className="calendarEventMeta">
        {event.familyMember}
      </span>
      {event.source === "single" && event.note ? (
        <span className="calendarEventDetailsIndicator" aria-hidden="true">
          ⓘ
        </span>
      ) : null}
    </>
  );

  if (event.source === "single" && event.note) {
    return (
      <button
        type="button"
        className={`calendarEvent calendarEventInteractive ${categoryClass} ${movieNightClass} ${gameNightClass} ${akTimeClass}`}
        aria-label={`Vis all informasjon om ${event.title}`}
        onClick={() => onOpen(event)}
      >
        {content}
      </button>
    );
  }

  return (
    <article
      className={`calendarEvent ${categoryClass} ${movieNightClass} ${gameNightClass} ${akTimeClass}`}
    >
      {content}
    </article>
  );
}

export function FamilyCalendar({
  recurringEvents,
  singleEvents,
  dayNotes = [],
  todayDateKey,
}: FamilyCalendarProps) {
  const [view, setView] = useState<CalendarView>("week");
  const [anchorDateKey, setAnchorDateKey] = useState(todayDateKey);
  const [selectedEvent, setSelectedEvent] = useState<{
    event: DashboardEvent;
    dateKey: string;
  } | null>(null);
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
            const notes = dayNotes.filter((note) => note.date === day.dateKey);
            const birthdayNotes = notes.filter(
              (note) => note.category === "birthday",
            );
            const regularNotes = notes.filter(
              (note) => note.category !== "birthday",
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

                {birthdayNotes.length > 0 ? (
                  <div className="calendarBirthdayNotes" aria-label="Bursdager">
                    {birthdayNotes.map((note) => (
                      <p key={note.id}>
                        <span aria-hidden="true">🎂</span>
                        <strong>{note.text} bursdag</strong>
                      </p>
                    ))}
                  </div>
                ) : null}

                <div className="calendarEvents">
                  {day.events.length > 0 ? (
                    <>
                      <div className="calendarEventsTop">
                        {schoolEvents.map((event) => (
                          <EventCard
                            event={event}
                            key={`${day.dateKey}-${event.id}`}
                            onOpen={(selected) =>
                              setSelectedEvent({ event: selected, dateKey: day.dateKey })
                            }
                          />
                        ))}
                      </div>
                      <div className="calendarEventsBottom">
                        {otherEvents.map((event) => (
                          <EventCard
                            event={event}
                            key={`${day.dateKey}-${event.id}`}
                            onOpen={(selected) =>
                              setSelectedEvent({ event: selected, dateKey: day.dateKey })
                            }
                          />
                        ))}
                        {leisureEvents.map((event) => (
                          <EventCard
                            event={event}
                            key={`${day.dateKey}-${event.id}`}
                            onOpen={(selected) =>
                              setSelectedEvent({ event: selected, dateKey: day.dateKey })
                            }
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="calendarNoEvents">Ingen avtaler</span>
                  )}
                </div>

                {regularNotes.length > 0 ? (
                  <div className="calendarDayNotes" aria-label="Dagsnotater">
                    {regularNotes.map((note) => (
                      <p key={note.id}>{note.text}</p>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>

      <FormModal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.event.title || "Hendelse"}
      >
        {selectedEvent ? (
          <div className="calendarEventDetails">
            <dl>
              <div>
                <dt>Dato</dt>
                <dd>
                  {capitalize(
                    formatDate(dateFromKey(selectedEvent.dateKey), {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                  )}
                </dd>
              </div>
              <div>
                <dt>Hvem</dt>
                <dd>{selectedEvent.event.familyMember}</dd>
              </div>
              <div>
                <dt>Tid</dt>
                <dd>
                  {selectedEvent.event.allDay
                    ? "Hele dagen"
                    : [selectedEvent.event.time, selectedEvent.event.endTime]
                        .filter(Boolean)
                        .join("–") || "Ikke angitt"}
                </dd>
              </div>
              {selectedEvent.event.categoryLabel ? (
                <div>
                  <dt>Kategori</dt>
                  <dd>{selectedEvent.event.categoryLabel}</dd>
                </div>
              ) : null}
            </dl>

            <div className="calendarEventDetailsNote">
              <h3>Notat</h3>
              <p>{selectedEvent.event.note}</p>
            </div>
          </div>
        ) : null}
      </FormModal>
    </section>
  );
}
