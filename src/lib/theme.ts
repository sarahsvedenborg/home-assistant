import { osloDateKey } from "@/lib/family-feed";

export type SeasonalThemeId = "autumn" | "christmas";
export type ThemeId = SeasonalThemeId | "birthday";

type SeasonalThemeSchedule = {
  id: SeasonalThemeId;
  /** Inclusive start, MM-DD, repeats every year. */
  start: string;
  /** Inclusive end, MM-DD, repeats every year. May wrap past New Year. */
  end: string;
};

/**
 * When each seasonal palette is active. Edit the dates here — not in Sanity.
 * Birthday theme still takes over automatically on days with a birthday.
 */
export const SEASONAL_THEME_SCHEDULE: SeasonalThemeSchedule[] = [
  { id: "autumn", start: "09-01", end: "11-30" },
];

function monthDayKey(dateKey: string): string {
  return dateKey.slice(5, 10);
}

function isWithinYearlyRange(monthDay: string, start: string, end: string): boolean {
  if (start <= end) {
    return monthDay >= start && monthDay <= end;
  }

  return monthDay >= start || monthDay <= end;
}

export function seasonalThemeForDate(dateKey: string): SeasonalThemeId | undefined {
  const monthDay = monthDayKey(dateKey);

  return SEASONAL_THEME_SCHEDULE.find((theme) =>
    isWithinYearlyRange(monthDay, theme.start, theme.end),
  )?.id;
}

export function themeForDate(
  dateKey: string,
  options?: { isBirthday?: boolean },
): ThemeId | undefined {
  if (options?.isBirthday) {
    return "birthday";
  }

  return seasonalThemeForDate(dateKey);
}

export function themeForToday(options?: { isBirthday?: boolean }): ThemeId | undefined {
  return themeForDate(osloDateKey(new Date()), options);
}
