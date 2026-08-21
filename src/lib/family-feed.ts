import type { RecurringEvent, ShoppingListEntry, WishListItem } from "@/lib/types";
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

// Events that occur on the given date: matching weekday, inside the active
// window, sorted by start time (undated events sort first).
export function eventsForDate(events: RecurringEvent[], date: Date): RecurringEvent[] {
  const weekday = osloWeekday(date);
  const dateKey = osloDateKey(date);

  return events
    .filter((event) => event.dayOfWeek === weekday && isActiveOn(event, dateKey))
    .sort((left, right) => (left.time || "").localeCompare(right.time || ""));
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
