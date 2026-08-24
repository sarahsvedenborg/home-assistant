import { eventCategoryLabel } from "@/lib/event-categories";
import { singleEventCategoryLabel } from "@/lib/single-event-categories";
import type {
  RecurringEvent,
  ShoppingListEntry,
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
// occurrences and single-day events both normalize to this.
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

function singleToDashboardEvent(event: SingleEvent): DashboardEvent {
  return {
    id: event.id,
    source: "single",
    title: event.title,
    familyMember: event.familyMember,
    time: event.allDay ? undefined : event.time,
    endTime: event.allDay ? undefined : event.endTime,
    category: event.category,
    categoryLabel: event.category
      ? singleEventCategoryLabel(event.category)
      : undefined,
    allDay: event.allDay,
    note: event.note,
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
    .filter((event) => osloDateKey(new Date(event.date)) === dateKey)
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

export type RecentActivityType = "wish" | "shopping";

export type RecentActivity = {
  id: string;
  type: RecentActivityType;
  title: string;
  person?: string;
  createdAt: string;
};

type BuildRecentActivityOptions = {
  now: Date;
  days?: number;
  limit?: number;
};

// Merge recently added wishlist and shopping-list items into a single feed,
// newest first. Items without a createdAt (e.g. legacy data) are skipped.
export function buildRecentActivity(
  wishlist: WishListItem[],
  shopping: ShoppingListEntry[],
  { now, days = 7, limit = 5 }: BuildRecentActivityOptions,
): RecentActivity[] {
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;

  const entries: RecentActivity[] = [];

  for (const wish of wishlist) {
    if (wish.createdAt) {
      entries.push({
        id: wish.id,
        type: "wish",
        title: wish.title,
        person: wish.submittedBy,
        createdAt: wish.createdAt,
      });
    }
  }

  for (const item of shopping) {
    if (item.createdAt) {
      entries.push({
        id: item.id,
        type: "shopping",
        title: item.title,
        person: item.addedBy,
        createdAt: item.createdAt,
      });
    }
  }

  return entries
    .filter((entry) => new Date(entry.createdAt).getTime() >= cutoff)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}
