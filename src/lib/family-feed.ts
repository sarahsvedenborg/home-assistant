import { BOARD_COLUMNS } from "@/lib/board";
import { eventCategoryLabel } from "@/lib/event-categories";
import { singleEventCategoryLabel } from "@/lib/single-event-categories";
import type {
  BoardIssue,
  MovieRecommendation,
  Recipe,
  RecurringEvent,
  SingleEvent,
  WishListItem,
} from "@/lib/types";
import type { WeekdayValue } from "@/lib/weekdays";

const OSLO_TZ = "Europe/Oslo";

// The homepage feed is rendered on the server, which may run in UTC. All
// "today"/"tomorrow" reasoning must therefore be anchored to Oslo local time,
// otherwise events flip a day late in the evening.

// "YYYY-MM-DD" for the given instant, in Oslo local time.
export function osloDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: OSLO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// The weekday for the given instant, in Oslo local time. The lowercased English
// weekday name matches our WeekdayValue union ("monday", "tuesday", ...).
export function osloWeekday(date: Date): WeekdayValue {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: OSLO_TZ,
    weekday: "long",
  })
    .format(date)
    .toLowerCase() as WeekdayValue;
}

// A recurring event is active on a date when the date falls inside its optional
// start/end window. Dates are compared on the date portion only, so a time-of-day
// on the boundary never excludes the day itself.
function isActiveOn(event: RecurringEvent, dateKey: string): boolean {
  if (event.startDate && event.startDate.slice(0, 10) > dateKey) {
    return false;
  }

  if (event.endDate && event.endDate.slice(0, 10) < dateKey) {
    return false;
  }

  return true;
}

// A unified event shape the dashboard renders, whatever the source. Recurring
// occurrences and dated events both normalize to this.
export type DashboardEvent = {
  id: string;
  source: "recurring" | "single";
  title: string;
  familyMember: string;
  time?: string;
  endTime?: string;
  category?: string;
  categoryLabel?: string;
  allDay?: boolean;
  note?: string;
  startDateKey?: string;
  endDateKey?: string;
};

export type CalendarDay = {
  dateKey: string;
  events: DashboardEvent[];
};

function toDashboardEvent(event: RecurringEvent): DashboardEvent {
  return {
    id: event.id,
    source: "recurring",
    title: event.title,
    familyMember: event.familyMember,
    time: event.time,
    endTime: event.endTime,
    category: event.category,
    categoryLabel: eventCategoryLabel(event.category),
  };
}

export function singleToDashboardEvent(event: SingleEvent): DashboardEvent {
  return {
    id: event.id,
    source: "single",
    title:
      event.category === "ak"
        ? "AK"
        : event.category === "filmkveld"
        ? "Filmkveld"
        : event.category === "spillkveld"
          ? "Spillkveld"
          : event.title,
    familyMember: event.familyMember,
    time: event.allDay ? undefined : event.time,
    endTime: event.allDay ? undefined : event.endTime,
    category: event.category,
    categoryLabel: event.category
      ? singleEventCategoryLabel(event.category)
      : undefined,
    allDay: event.allDay,
    note: event.note,
    startDateKey: event.date.slice(0, 10),
    endDateKey: (event.endDate || event.date).slice(0, 10),
  };
}

function dateFromKey(dateKey: string): Date {
  // Noon UTC remains on the same calendar date in Oslo throughout the year.
  return new Date(`${dateKey}T12:00:00Z`);
}

function nextDateKey(dateKey: string): string {
  const date = dateFromKey(dateKey);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function eventsForDateKey(
  recurring: RecurringEvent[],
  single: SingleEvent[],
  dateKey: string,
): DashboardEvent[] {
  const weekday = osloWeekday(dateFromKey(dateKey));

  const recurringToday = recurring
    .filter((event) => event.dayOfWeek === weekday && isActiveOn(event, dateKey))
    .map(toDashboardEvent);

  const singleToday = single
    .filter((event) => {
      const startDateKey = event.date.slice(0, 10);
      const endDateKey = (event.endDate || event.date).slice(0, 10);

      return dateKey >= startDateKey && dateKey <= endDateKey;
    })
    .map(singleToDashboardEvent);

  return [...recurringToday, ...singleToday].sort((left, right) =>
    (left.time || "").localeCompare(right.time || ""),
  );
}

export function eventsForDateRange(
  recurring: RecurringEvent[],
  single: SingleEvent[],
  startDateKey: string,
  endDateKey: string,
): CalendarDay[] {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDateKey) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDateKey) ||
    startDateKey > endDateKey
  ) {
    return [];
  }

  const days: CalendarDay[] = [];

  for (let dateKey = startDateKey; dateKey <= endDateKey; dateKey = nextDateKey(dateKey)) {
    days.push({
      dateKey,
      events: eventsForDateKey(recurring, single, dateKey),
    });
  }

  return days;
}

// Everything happening on the given date: recurring occurrences (matching
// weekday, inside their active window) merged with single-day events on that
// date. Sorted by start time, with all-day / untimed entries first.
export function eventsForDate(
  recurring: RecurringEvent[],
  single: SingleEvent[],
  date: Date,
): DashboardEvent[] {
  return eventsForDateKey(recurring, single, osloDateKey(date));
}

export type RecentActivityType = "wish" | "movie" | "recipe" | "issue";

export type RecentActivity = {
  id: string;
  type: RecentActivityType;
  title: string;
  detail?: string;
  createdAt: string;
};

type BuildRecentActivityInput = {
  wishlist: WishListItem[];
  movies: MovieRecommendation[];
  recipes: Recipe[];
  issues: BoardIssue[];
};

type BuildRecentActivityOptions = {
  now: Date;
  days?: number;
  limit?: number;
};

function isRecent(timestamp: string | undefined, cutoff: number) {
  if (!timestamp) {
    return false;
  }

  const time = new Date(timestamp).getTime();
  return Number.isFinite(time) && time >= cutoff;
}

function namedPerson(person?: string) {
  const name = person?.trim();
  if (!name || name === "Someone" || name === "Ukjent") {
    return undefined;
  }

  return name;
}

function activityTitle(value: string | undefined, fallback: string) {
  const title = value?.trim().replace(/\s+/g, " ") || "";
  if (!title) {
    return fallback;
  }

  if (title.length <= 90) {
    return title;
  }

  return `${title.slice(0, 87)}…`;
}

function issueStatusLabel(status: BoardIssue["status"]) {
  return BOARD_COLUMNS.find((column) => column.value === status)?.label || status;
}

// Newest family additions and board status changes. Entries without a
// timestamp are skipped.
export function buildRecentActivity(
  { wishlist, movies, recipes, issues }: BuildRecentActivityInput,
  { now, days = 7, limit = 5 }: BuildRecentActivityOptions,
): RecentActivity[] {
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  const activity: RecentActivity[] = [];

  for (const wish of wishlist) {
    if (!isRecent(wish.createdAt, cutoff) || !wish.createdAt) {
      continue;
    }

    const person = namedPerson(wish.submittedBy);
    activity.push({
      id: wish.id,
      type: "wish",
      title: activityTitle(wish.title, "Ønske"),
      detail: person ? `${person} ønsket seg` : "Nytt ønske",
      createdAt: wish.createdAt,
    });
  }

  for (const movie of movies) {
    if (!isRecent(movie.createdAt, cutoff) || !movie.createdAt) {
      continue;
    }

    const person = namedPerson(movie.suggestedBy);
    activity.push({
      id: movie.id,
      type: "movie",
      title: activityTitle(movie.title, "Film"),
      detail: person ? `${person} la til en film` : "Ny film",
      createdAt: movie.createdAt,
    });
  }

  for (const recipe of recipes) {
    if (!isRecent(recipe.createdAt, cutoff) || !recipe.createdAt) {
      continue;
    }

    activity.push({
      id: recipe.id,
      type: "recipe",
      title: activityTitle(recipe.title, "Oppskrift"),
      detail: "Ny oppskrift",
      createdAt: recipe.createdAt,
    });
  }

  for (const issue of issues) {
    if (!isRecent(issue.statusChangedAt, cutoff) || !issue.statusChangedAt) {
      continue;
    }

    activity.push({
      id: issue.id,
      type: "issue",
      title: activityTitle(issue.title || issue.text, "Oppgave"),
      detail: `Endret til ${issueStatusLabel(issue.status)}`,
      createdAt: issue.statusChangedAt,
    });
  }

  return activity
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}
