"use client";

import { Fragment, useLayoutEffect, useMemo, useRef, useState } from "react";

import { FormModal } from "@/components/form-modal";
import { birthdaysOnDate } from "@/lib/birthdays";
import {
  eventsForDateRange,
  singleToDashboardEvent,
  type CalendarDay,
  type DashboardEvent,
} from "@/lib/family-feed";
import type {
  Birthday,
  DayNote,
  NorwegianHoliday,
  RecurringEvent,
  SingleEvent,
} from "@/lib/types";

type CalendarView = "week" | "month";

type FamilyCalendarProps = {
  recurringEvents: RecurringEvent[];
  singleEvents: SingleEvent[];
  birthdays?: Birthday[];
  dayNotes?: DayNote[];
  holidays?: NorwegianHoliday[];
  todayDateKey: string;
  initialEventId?: string;
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

function monthEventCounts(events: DashboardEvent[]) {
  return {
    school: events.filter(
      (event) => event.source === "recurring" && event.category === "skole",
    ).length,
    single: events.filter((event) => event.source === "single").length,
    leisure: events.filter(
      (event) => event.source === "recurring" && event.category === "fritid",
    ).length,
  };
}

function eventCountLabel(
  kind: "school" | "single" | "leisure",
  count: number,
): string {
  if (kind === "school") {
    return count === 1 ? "1 skoleaktivitet" : `${count} skoleaktiviteter`;
  }

  if (kind === "leisure") {
    return count === 1 ? "1 fritidsaktivitet" : `${count} fritidsaktiviteter`;
  }

  return count === 1 ? "1 hendelse" : `${count} hendelser`;
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

function isoWeekNumber(date: Date): number {
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const isoDay = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - isoDay);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));

  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function periodTitle(view: CalendarView, anchor: Date, days: CalendarDay[]): string {
  if (view === "month") {
    return capitalize(formatDate(anchor, { month: "long", year: "numeric" }));
  }

  const start = dateFromKey(days[0]?.dateKey ?? dateKey(anchor));
  const end = dateFromKey(days.at(-1)?.dateKey ?? dateKey(anchor));
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const weekLabel = `Uke ${isoWeekNumber(start)}`;

  if (sameMonth) {
    return `${start.getUTCDate()}.–${formatDate(end, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} · ${weekLabel}`;
  }

  return `${weekLabel} · ${formatDate(start, {
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

function selectionForEventId(singleEvents: SingleEvent[], eventId?: string) {
  if (!eventId) {
    return null;
  }

  const match = singleEvents.find((event) => event.id === eventId && event.note);

  if (!match) {
    return null;
  }

  const event = singleToDashboardEvent(match);
  return {
    event,
    dateKey: event.startDateKey || match.date.slice(0, 10),
  };
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

function CalendarDayDetail({
  day,
  dayNotes,
  birthdays,
  holidays,
  onOpenEvent,
}: {
  day: CalendarDay;
  dayNotes: DayNote[];
  birthdays: Birthday[];
  holidays: NorwegianHoliday[];
  onOpenEvent: (event: DashboardEvent) => void;
}) {
  const dayEvents = day.events.filter((event) => !isMultiDayEvent(event));
  const spanningEvents = day.events.filter(isMultiDayEvent);
  const schoolEvents = dayEvents.filter((event) => event.category === "skole");
  const leisureEvents = dayEvents.filter((event) => event.category === "fritid");
  const otherEvents = dayEvents.filter(
    (event) => event.category !== "skole" && event.category !== "fritid",
  );
  const notes = dayNotes.filter(
    (note) =>
      day.dateKey >= note.date && day.dateKey <= (note.endDate || note.date),
  );
  const birthdayNotes = birthdaysOnDate(birthdays, day.dateKey);
  const vacationNotes = notes.filter((note) => note.category === "vacation");
  const holydayNotes = notes.filter((note) => note.category === "holyday");
  const proveNotes = notes.filter((note) => note.category === "prove");
  const publicHolidays = holidays.filter((holiday) => holiday.date === day.dateKey);
  const regularNotes = notes.filter(
    (note) =>
      note.category !== "birthday" &&
      note.category !== "vacation" &&
      note.category !== "holyday" &&
      note.category !== "prove",
  );
  const hasEvents =
    schoolEvents.length +
      otherEvents.length +
      leisureEvents.length +
      spanningEvents.length >
    0;

  return (
    <div className="calendarDayDetail">
      {vacationNotes.length > 0 ? (
        <div className="calendarSpanningVacations" aria-label="Ferie">
          {vacationNotes.map((note) => (
            <article
              className="calendarSpanningEvent calendarSpanningVacation calendarSpanningRoundLeft calendarSpanningRoundRight"
              key={note.id}
            >
              <strong>{note.text}</strong>
            </article>
          ))}
        </div>
      ) : null}

      {birthdayNotes.length > 0 ||
      holydayNotes.length > 0 ||
      proveNotes.length > 0 ||
      publicHolidays.length > 0 ? (
        <div className="calendarTopNotes">
          {publicHolidays.length > 0 ? (
            <div className="calendarPublicHolidays" aria-label="Norske helligdager">
              {publicHolidays.map((holiday) => (
                <p key={`${holiday.date}-${holiday.name}`}>{holiday.name}</p>
              ))}
            </div>
          ) : null}

          {birthdayNotes.length > 0 ? (
            <div className="calendarBirthdayNotes" aria-label="Bursdager">
              {birthdayNotes.map((birthday) => (
                <p key={birthday.id}>
                  <span aria-hidden="true">🎂</span>
                  <strong>
                    {birthday.name} {birthday.age} år
                  </strong>
                </p>
              ))}
            </div>
          ) : null}

          {holydayNotes.length > 0 ? (
            <div className="calendarHolydayNotes" aria-label="Holyday">
              {holydayNotes.map((note) => (
                <p key={note.id}>
                  <span className="calendarHolydayIcon" aria-hidden="true" />
                  <strong>{note.text}</strong>
                </p>
              ))}
            </div>
          ) : null}

          {proveNotes.length > 0 ? (
            <div className="calendarProveNotes" aria-label="Prøver">
              {proveNotes.map((note) => (
                <p key={note.id}>
                  <span className="calendarProveIcon" aria-hidden="true" />
                  <strong>{note.text}</strong>
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="calendarEvents">
        {hasEvents ? (
          <>
            {schoolEvents.length > 0 ? (
              <div className="calendarEventsTop">
                {schoolEvents.map((event) => (
                  <EventCard
                    event={event}
                    key={`${day.dateKey}-${event.id}`}
                    onOpen={onOpenEvent}
                  />
                ))}
              </div>
            ) : null}
            {otherEvents.length > 0 ||
            leisureEvents.length > 0 ||
            spanningEvents.length > 0 ? (
              <div className="calendarEventsBottom">
                {otherEvents.map((event) => (
                  <EventCard
                    event={event}
                    key={`${day.dateKey}-${event.id}`}
                    onOpen={onOpenEvent}
                  />
                ))}
                {leisureEvents.map((event) => (
                  <EventCard
                    event={event}
                    key={`${day.dateKey}-${event.id}`}
                    onOpen={onOpenEvent}
                  />
                ))}
                {spanningEvents.map((event) => (
                  <EventCard
                    event={event}
                    key={`${day.dateKey}-${event.id}`}
                    onOpen={onOpenEvent}
                  />
                ))}
              </div>
            ) : null}
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
    </div>
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
  birthdays = [],
  dayNotes = [],
  holidays = [],
  todayDateKey,
  initialEventId,
}: FamilyCalendarProps) {
  const initialSelection = selectionForEventId(singleEvents, initialEventId);
  const [view, setView] = useState<CalendarView>("week");
  const [anchorDateKey, setAnchorDateKey] = useState(
    initialSelection?.dateKey || todayDateKey,
  );
  const [selectedEvent, setSelectedEvent] = useState<{
    event: DashboardEvent;
    dateKey: string;
  } | null>(initialSelection);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
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

  const selectedDay = useMemo(
    () => days.find((day) => day.dateKey === selectedDayKey) || null,
    [days, selectedDayKey],
  );

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

    setSelectedDayKey(null);
    setAnchorDateKey(dateKey(next));
  }

  function changeView(nextView: CalendarView) {
    setSelectedDayKey(null);
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
            {view === "week" ? "Denne uken" : "Denne måneden"}
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
          {view === "month" ? (
            <div className="calendarWeekNumberHeader" aria-hidden="true" />
          ) : null}
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
            const birthdayNotes = birthdaysOnDate(birthdays, day.dateKey);
            const vacationNotes = notes.filter(
              (note) => note.category === "vacation",
            );
            const holydayNotes = notes.filter(
              (note) => note.category === "holyday",
            );
            const proveNotes = notes.filter((note) => note.category === "prove");
            const publicHolidays = holidays.filter(
              (holiday) => holiday.date === day.dateKey,
            );
            const regularNotes = notes.filter(
              (note) =>
                note.category !== "birthday" &&
                note.category !== "vacation" &&
                note.category !== "holyday" &&
                note.category !== "prove",
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

            const counts = monthEventCounts(day.events);
            const hasMonthCounts =
              counts.school > 0 || counts.single > 0 || counts.leisure > 0;
            const weekNumber = isoWeekNumber(date);

            return (
              <Fragment key={day.dateKey}>
              {view === "month" && dayIndex % 7 === 0 ? (
                <div
                  className="calendarWeekNumber"
                  aria-label={`Uke ${weekNumber}`}
                >
                  {weekNumber}
                </div>
              ) : null}
              <section className={className}>
                {view === "month" ? (
                  <button
                    type="button"
                    className="calendarDayHit"
                    aria-label={`Vis ${formatLongDateKey(day.dateKey)}`}
                    onClick={() => setSelectedDayKey(day.dateKey)}
                  />
                ) : null}
                <div className="calendarDayHeading">
                  <div className="calendarDayHeadingStart">
                    <time dateTime={day.dateKey}>
                      {view === "week"
                        ? capitalize(formatDate(date, { day: "numeric", month: "short" }))
                        : date.getUTCDate()}
                    </time>
                    {view === "month" && hasMonthCounts ? (
                      <span className="calendarDayEventCounts">
                        {counts.school > 0 ? (
                          <span
                            className="calendarDayEventCount calendarDayEventCountSchool"
                            aria-label={eventCountLabel("school", counts.school)}
                          >
                            {counts.school}
                          </span>
                        ) : null}
                        {counts.single > 0 ? (
                          <span
                            className="calendarDayEventCount calendarDayEventCountSingle"
                            aria-label={eventCountLabel("single", counts.single)}
                          >
                            {counts.single}
                          </span>
                        ) : null}
                        {counts.leisure > 0 ? (
                          <span
                            className="calendarDayEventCount calendarDayEventCountLeisure"
                            aria-label={eventCountLabel("leisure", counts.leisure)}
                          >
                            {counts.leisure}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                  {isToday ? <span className="calendarDayTodayLabel">I dag</span> : null}
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
                proveNotes.length > 0 ||
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
                        {birthdayNotes.map((birthday) => (
                          <p key={birthday.id}>
                            <span aria-hidden="true">🎂</span>
                            <strong>
                              {birthday.name} {birthday.age} år
                            </strong>
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

                    {proveNotes.length > 0 ? (
                      <div className="calendarProveNotes" aria-label="Prøver">
                        {proveNotes.map((note) => (
                          <p key={note.id}>
                            <span
                              className="calendarProveIcon"
                              aria-hidden="true"
                            />
                            <strong>{note.text}</strong>
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {view === "week" ? (
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
                ) : null}

                {regularNotes.length > 0 ? (
                  <div className="calendarDayNotes" aria-label="Dagsnotater">
                    {regularNotes.map((note) => (
                      <p key={note.id}>{note.text}</p>
                    ))}
                  </div>
                ) : null}

                {view === "week" && spanningSlots.length > 0 ? (
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
              </Fragment>
            );
          })}
        </div>
      </div>

      <FormModal
        isOpen={Boolean(selectedDay)}
        onClose={() => setSelectedDayKey(null)}
        title={selectedDay ? formatLongDateKey(selectedDay.dateKey) : "Dag"}
        size="wide"
        className="formModalCalendarDay"
      >
        {selectedDay ? (
          <CalendarDayDetail
            day={selectedDay}
            dayNotes={dayNotes}
            birthdays={birthdays}
            holidays={holidays}
            onOpenEvent={(event) => {
              setSelectedDayKey(null);
              setSelectedEvent({ event, dateKey: selectedDay.dateKey });
            }}
          />
        ) : null}
      </FormModal>

      <FormModal
        isOpen={Boolean(selectedEvent)}
        onClose={() => {
          setSelectedEvent(null);

          if (typeof window !== "undefined" && window.location.search.includes("event=")) {
            const url = new URL(window.location.href);
            url.searchParams.delete("event");
            window.history.replaceState(
              null,
              "",
              url.pathname + url.search + url.hash,
            );
          }
        }}
        title={selectedEvent?.event.title || "Hendelse"}
        className="formModalEventDetails"
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
