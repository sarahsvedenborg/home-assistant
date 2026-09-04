import "server-only";

import type { NorwegianHoliday } from "@/lib/types";

type NagerHoliday = {
  date?: unknown;
  name?: unknown;
};

const NORWEGIAN_HOLIDAY_NAMES: Record<string, string> = {
  "New Year's Day": "Første nyttårsdag",
  "Maundy Thursday": "Skjærtorsdag",
  "Good Friday": "Langfredag",
  "Easter Sunday": "Første påskedag",
  "Easter Monday": "Andre påskedag",
  "Labour Day": "Arbeidernes dag",
  "Ascension Day": "Kristi himmelfartsdag",
  "Constitution Day": "Grunnlovsdagen",
  Pentecost: "Første pinsedag",
  "Whit Monday": "Andre pinsedag",
  "Christmas Day": "Første juledag",
  "St. Stephen's Day": "Andre juledag",
};

async function getHolidaysForYear(year: number): Promise<NorwegianHoliday[]> {
  try {
    const response = await fetch(
      `https://date.nager.at/api/v4/Holidays/NO/${year}`,
      { next: { revalidate: 86400 } },
    );

    if (!response.ok) {
      return [];
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return (data as NagerHoliday[]).flatMap((holiday) => {
      if (
        typeof holiday.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(holiday.date) ||
        typeof holiday.name !== "string"
      ) {
        return [];
      }

      return [
        {
          date: holiday.date,
          name: NORWEGIAN_HOLIDAY_NAMES[holiday.name] || holiday.name,
        },
      ];
    });
  } catch {
    return [];
  }
}

export async function getNorwegianPublicHolidays(
  years: number[],
): Promise<NorwegianHoliday[]> {
  const uniqueYears = [...new Set(years)].filter(
    (year) => Number.isInteger(year) && year >= 1900 && year <= 2200,
  );
  const holidays = await Promise.all(uniqueYears.map(getHolidaysForYear));

  return holidays
    .flat()
    .sort((left, right) => left.date.localeCompare(right.date));
}
