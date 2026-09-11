"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { FormModal } from "@/components/form-modal";
import { eventsForDateRange, type CalendarDay, type DashboardEvent } from "@/lib/family-feed";
import type {
  DayNote,
  NorwegianHoliday,
  RecurringEvent,
  SingleEvent,
} from "@/lib/types";

type CalendarView = "week" | "month";

type FamilyCalendarProps = {
  recurringEvents: RecurringEvent[];
  singleEvents: SingleEvent[];
  dayNotes?: DayNote[];
  holidays?: NorwegianHoliday[];
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

function formatLongDateKey(value: string): string {
  return capitalize(
    formatDate(dateFromKey(value), {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );
}

type SpanningRange = {
  id: string;
  startDateKey: string;
  endDateKey: string;
  title: string;
};

function isMultiDayEvent(event: DashboardEvent): boolean {
  return (
    event.source === "single" &&
    Boolean(
      event.startDateKey &&
        event.endDateKey &&
        event.startDateKey < event.endDateKey,
    )
  );
}

function uniqueSpanningEvents(days: CalendarDay[]): DashboardEvent[] {
  const events = new Map<string, DashboardEvent>();

  for (const day of days) {
    for (const event of day.events) {
      if (isMultiDayEvent(event)) {
        events.set(event.id, event);
      }
    }
  }

  return [...events.values()];
}

function assignSpanningLanes(items: SpanningRange[]): Map<string, number> {
  const sorted = [...items].sort((left, right) => {
    const start = left.startDateKey.localeCompare(right.startDateKey);
    if (start !== 0) {
      return start;
    }

    const longerLast = right.endDateKey.localeCompare(left.endDateKey);
    if (longerLast !== 0) {
      return longerLast;
    }

    return left.title.localeCompare(right.title, "nb");
  });
  const laneEndKeys: string[] = [];
  const lanes = new Map<string, number>();

  for (const item of sorted) {
    let lane = laneEndKeys.findIndex((laneEnd) => laneEnd < item.startDateKey);

    if (lane < 0) {
      lane = laneEndKeys.length;
      laneEndKeys.push(item.endDateKey);
    } else {
      laneEndKeys[lane] = item.endDateKey;
    }

    lanes.set(item.id, lane);
  }

  return lanes;
}

function spanningWeeksFromDays(days: CalendarDay[]): Array<Map<string, number>> {
  const weeks: Array<Map<string, number>> = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(
      assignSpanningLanes(
        uniqueSpanningEvents(days.slice(index, index + 7)).map((event) => ({
          id: event.id,
          startDateKey: event.startDateKey || "",
          endDateKey: event.endDateKey || "",
          title: event.title,
        })),
      ),
    );
  }

  return weeks;
}

function spanningWeeksFromVacationNotes(
  days: CalendarDay[],
  dayNotes: DayNote[],
): Array<Map<string, number>> {
  const weeks: Array<Map<string, number>> = [];

  for (let index = 0; index < days.length; index += 7) {
    const weekDays = days.slice(index, index + 7);
    const weekStart = weekDays[0]?.dateKey;
    const weekEnd = weekDays.at(-1)?.dateKey;

    if (!weekStart || !weekEnd) {
      weeks.push(new Map());
      continue;
    }

    const ranges: SpanningRange[] = [];
    const seen = new Set<string>();

    for (const note of dayNotes) {
      if (note.category !== "vacation" || seen.has(note.id)) {
        continue;
      }

      const startDateKey = note.date;
      const endDateKey = note.endDate || note.date;

      if (endDateKey < weekStart || startDateKey > weekEnd) {
        continue;
      }

      seen.add(note.id);
      ranges.push({
        id: note.id,
        startDateKey,
        endDateKey,
        title: note.text,
      });
    }

    weeks.push(assignSpanningLanes(ranges));
  }

  return weeks;
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

function eventTimeLabel(event: DashboardEvent): string | null {
  if (event.allDay) {
    return "Hele dagen";
  }

  return [event.time, event.endTime].filter(Boolean).join("–") || null;
}

function eventSpecialIcon(event: DashboardEvent): string | null {
  if (event.source !== "single") {
    return null;
  }

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

function EventDetails({ event }: { event: DashboardEvent }) {
  const time = eventTimeLabel(event);
  const specialEventIcon = eventSpecialIcon(event);
  const isAkTime = event.source === "single" && event.category === "ak";

  return (
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
      {event.familyMember ? (
        <span className="calendarEventMeta">{event.familyMember}</span>
      ) : null}
      {event.source === "single" && event.note ? (
        <span className="calendarEventDetailsIndicator" aria-hidden="true">
          ⓘ
        </span>
      ) : null}
    </>
  );
}

function EventCard({
  event,
  onOpen,
}: {
  event: DashboardEvent;
  onOpen: (event: DashboardEvent) => void;
}) {
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

  if (event.source === "single" && event.note) {
    return (
      <button
        type="button"
        className={`calendarEvent calendarEventInteractive ${categoryClass} ${movieNightClass} ${gameNightClass} ${akTimeClass}`}
        aria-label={`Vis all informasjon om ${event.title}`}
        onClick={() => onOpen(event)}
      >
        <EventDetails event={event} />
      </button>
    );
  }

  return (
    <article
      className={`calendarEvent ${categoryClass} ${movieNightClass} ${gameNightClass} ${akTimeClass}`}
    >
      <EventDetails event={event} />
    </article>
  );
}

function eventToneClass(event: DashboardEvent): string {
  const categoryClass =
    event.category === "skole"
      ? "calendarEventSchool"
      : event.category === "fritid"
        ? "calendarEventLeisure"
        : "calendarEventSingle";
  const movieNightClass =
    event.source === "single" && event.category === "filmkveld"
      ? "calendarEventMovieNight"
      : "";
  const gameNightClass =
    event.source === "single" && event.category === "spillkveld"
      ? "calendarEventGameNight"
      : "";
  const akTimeClass =
    event.source === "single" && event.category === "ak"
      ? "calendarEventAkTime"
      : "";

  return [categoryClass, movieNightClass, gameNightClass, akTimeClass]
    .filter(Boolean)
    .join(" ");
}

function SpanningEventCard({
  event,
  dateKey,
  onOpen,
}: {
  event: DashboardEvent;
  dateKey: string;
  onOpen: (event: DashboardEvent) => void;
}) {
  const date = dateFromKey(dateKey);
  const weekdayIndex = (date.getUTCDay() + 6) % 7;
  const isStart = dateKey === event.startDateKey;
  const roundLeft = isStart || weekdayIndex === 0;
  const roundRight = dateKey === event.endDateKey || weekdayIndex === 6;
  const className = [
    "calendarSpanningEvent",
    eventToneClass(event),
    isStart ? "calendarSpanningEventStart" : "",
    roundLeft ? "calendarSpanningRoundLeft" : "",
    roundRight ? "calendarSpanningRoundRight" : "",
    roundLeft ? "" : "calendarSpanningExtendLeft",
    roundRight ? "" : "calendarSpanningExtendRight",
    event.note ? "calendarEventInteractive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = isStart ? (
    <EventDetails event={event} />
  ) : (
    <strong className={roundLeft ? undefined : "srOnly"}>{event.title}</strong>
  );

  if (event.note) {
    return (
      <button
        type="button"
        className={className}
        data-spanning-id={event.id}
        aria-label={`Vis all informasjon om ${event.title}`}
        onClick={() => onOpen(event)}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={className} data-spanning-id={event.id}>
      {content}
    </article>
  );
}

function SpanningVacationNote({
  note,
  dateKey,
}: {
  note: DayNote;
  dateKey: string;
}) {
  const date = dateFromKey(dateKey);
  const weekdayIndex = (date.getUTCDay() + 6) % 7;
  const startDateKey = note.date;
  const endDateKey = note.endDate || note.date;
  const isStart = dateKey === startDateKey;
  const roundLeft = isStart || weekdayIndex === 0;
  const roundRight = dateKey === endDateKey || weekdayIndex === 6;
  const className = [
    "calendarSpanningEvent",
    "calendarSpanningVacation",
    roundLeft ? "calendarSpanningRoundLeft" : "",
    roundRight ? "calendarSpanningRoundRight" : "",
    roundLeft ? "" : "calendarSpanningExtendLeft",
    roundRight ? "" : "calendarSpanningExtendRight",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className} data-spanning-id={note.id}>
      <strong className={roundLeft ? undefined : "srOnly"}>{note.text}</strong>
    </article>
  );
}

export function FamilyCalendar({
  recurringEvents,
  singleEvents,
  dayNotes = [],
  holidays = [],
  todayDateKey,
}: FamilyCalendarProps) {
  const [view, setView] = useState<CalendarView>("week");
  const [anchorDateKey, setAnchorDateKey] = useState(todayDateKey);
  const [selectedEvent, setSelectedEvent] = useState<{
    event: DashboardEvent;
    dateKey: string;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const anchor = useMemo(() => dateFromKey(anchorDateKey), [anchorDateKey]);

  const { days, spanningWeeks, vacationWeeks, visibleMonth } = useMemo(() => {
    const start =
      view === "week" ? startOfWeek(anchor) : monthGridStart(anchor);
    const end = addDays(start, view === "week" ? 6 : 41);
    const days = eventsForDateRange(
      recurringEvents,
      singleEvents,
      dateKey(start),
      dateKey(end),
    );

    return {
      days,
      spanningWeeks: spanningWeeksFromDays(days),
      vacationWeeks: spanningWeeksFromVacationNotes(days, dayNotes),
      visibleMonth: anchor.getUTCMonth(),
    };
  }, [anchor, dayNotes, recurringEvents, singleEvents, view]);

  useLayoutEffect(() => {
    const calendarGrid = gridRef.current;

    if (!calendarGrid) {
      return;
    }

    const grid = calendarGrid;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => syncSpanningHeights(grid));
    });

    function syncSpanningHeights(calendarRoot: HTMLDivElement) {
      observer.disconnect();

      const nodes = [
        ...calendarRoot.querySelectorAll<HTMLElement>("[data-spanning-id]"),
      ];
      const groups = new Map<string, HTMLElement[]>();

      for (const node of nodes) {
        const id = node.dataset.spanningId;

        if (!id) {
          continue;
        }

        const group = groups.get(id) ?? [];
        group.push(node);
        groups.set(id, group);
      }

      for (const group of groups.values()) {
        for (const node of group) {
          node.style.minHeight = "";
        }

        const height = Math.max(...group.map((node) => node.offsetHeight));

        for (const node of group) {
          node.style.minHeight = `${height}px`;
        }
      }

      observer.observe(calendarRoot);
    }

    syncSpanningHeights(grid);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [dayNotes, days, view]);

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
        <div
          className={`calendarGrid calendarGrid${view === "week" ? "Week" : "Month"}`}
          ref={gridRef}
        >
          {WEEKDAY_LABELS.map((label) => (
            <div className="calendarWeekday" key={label}>
              {label}
            </div>
          ))}

          {days.map((day, dayIndex) => {
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
            const dayEvents = day.events.filter((event) => !isMultiDayEvent(event));
            const spanningEvents = day.events.filter(isMultiDayEvent);
            const schoolEvents = dayEvents.filter((event) => event.category === "skole");
            const leisureEvents = dayEvents.filter((event) => event.category === "fritid");
            const otherEvents = dayEvents.filter(
              (event) => event.category !== "skole" && event.category !== "fritid",
            );
            const weekLanes = spanningWeeks[Math.floor(dayIndex / 7)];
            const spanningHighestLane = spanningEvents.reduce((highest, event) => {
              const lane = weekLanes?.get(event.id) ?? 0;
              return Math.max(highest, lane);
            }, 0);
            const spanningSlots: Array<DashboardEvent | null> = [];

            if (spanningEvents.length > 0) {
              for (let lane = spanningHighestLane; lane >= 0; lane -= 1) {
                spanningSlots.push(
                  spanningEvents.find((event) => (weekLanes?.get(event.id) ?? 0) === lane) ??
                    null,
                );
              }
            }
            const notes = dayNotes.filter(
              (note) =>
                day.dateKey >= note.date &&
                day.dateKey <= (note.endDate || note.date),
            );
            const birthdayNotes = notes.filter(
              (note) => note.category === "birthday",
            );
            const vacationNotes = notes.filter(
              (note) => note.category === "vacation",
            );
            const holydayNotes = notes.filter(
              (note) => note.category === "holyday",
            );
            const publicHolidays = holidays.filter(
              (holiday) => holiday.date === day.dateKey,
            );
            const regularNotes = notes.filter(
              (note) =>
                note.category !== "birthday" &&
                note.category !== "vacation" &&
                note.category !== "holyday",
            );
            const weekVacationLanes = vacationWeeks[Math.floor(dayIndex / 7)];
            const vacationHighestLane = vacationNotes.reduce((highest, note) => {
              const lane = weekVacationLanes?.get(note.id) ?? 0;
              return Math.max(highest, lane);
            }, 0);
            const vacationSlots: Array<DayNote | null> = [];

            if (vacationNotes.length > 0) {
              for (let lane = 0; lane <= vacationHighestLane; lane += 1) {
                vacationSlots.push(
                  vacationNotes.find(
                    (note) => (weekVacationLanes?.get(note.id) ?? 0) === lane,
                  ) ?? null,
                );
              }
            }

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

                {vacationSlots.length > 0 ? (
                  <div className="calendarSpanningVacations" aria-label="Ferie">
                    {vacationSlots.map((note, slotIndex) =>
                      note ? (
                        <SpanningVacationNote
                          note={note}
                          dateKey={day.dateKey}
                          key={`${day.dateKey}-${note.id}`}
                        />
                      ) : (
                        <div
                          className="calendarSpanningSlot"
                          key={`${day.dateKey}-vacation-lane-${slotIndex}`}
                        />
                      ),
                    )}
                  </div>
                ) : null}

                {birthdayNotes.length > 0 ||
                holydayNotes.length > 0 ||
                publicHolidays.length > 0 ? (
                  <div className="calendarTopNotes">
                    {publicHolidays.length > 0 ? (
                      <div
                        className="calendarPublicHolidays"
                        aria-label="Norske helligdager"
                      >
                        {publicHolidays.map((holiday) => (
                          <p key={`${holiday.date}-${holiday.name}`}>
                            {holiday.name}
                          </p>
                        ))}
                      </div>
                    ) : null}

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

                    {holydayNotes.length > 0 ? (
                      <div className="calendarHolydayNotes" aria-label="Holyday">
                        {holydayNotes.map((note) => (
                          <p key={note.id}>
                            <span
                              className="calendarHolydayIcon"
                              aria-hidden="true"
                            />
                            <strong>{note.text}</strong>
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="calendarEvents">
                  {dayEvents.length > 0 ? (
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
                  ) : spanningEvents.length === 0 ? (
                    <span className="calendarNoEvents">Ingen avtaler</span>
                  ) : null}
                </div>

                {regularNotes.length > 0 ? (
                  <div className="calendarDayNotes" aria-label="Dagsnotater">
                    {regularNotes.map((note) => (
                      <p key={note.id}>{note.text}</p>
                    ))}
                  </div>
                ) : null}

                {spanningSlots.length > 0 ? (
                  <div className="calendarSpanningEvents" aria-label="Flerdagers hendelser">
                    {spanningSlots.map((event, slotIndex) =>
                      event ? (
                        <SpanningEventCard
                          event={event}
                          dateKey={day.dateKey}
                          key={`${day.dateKey}-${event.id}`}
                          onOpen={(selected) =>
                            setSelectedEvent({ event: selected, dateKey: day.dateKey })
                          }
                        />
                      ) : (
                        <div
                          className="calendarSpanningSlot"
                          key={`${day.dateKey}-lane-${slotIndex}`}
                        />
                      ),
                    )}
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
                  {selectedEvent.event.startDateKey &&
                  selectedEvent.event.endDateKey &&
                  selectedEvent.event.startDateKey !==
                    selectedEvent.event.endDateKey
                    ? `${formatLongDateKey(selectedEvent.event.startDateKey)} – ${formatLongDateKey(selectedEvent.event.endDateKey)}`
                    : formatLongDateKey(
                        selectedEvent.event.startDateKey ||
                          selectedEvent.dateKey,
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
