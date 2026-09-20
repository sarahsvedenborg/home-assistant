import type { Birthday } from "@/lib/types";

export type DatedBirthday = Birthday & { age: number };

export function monthDayKey(value: string): string {
  return value.slice(5, 10);
}

export function turningAge(birthDate: string, onDateKey: string): number | null {
  const birthYear = Number(birthDate.slice(0, 4));
  const onYear = Number(onDateKey.slice(0, 4));

  if (!Number.isInteger(birthYear) || !Number.isInteger(onYear)) {
    return null;
  }

  const age = onYear - birthYear;
  return age >= 0 ? age : null;
}

export function birthdaysOnDate(birthdays: Birthday[], dateKey: string): DatedBirthday[] {
  return birthdays.flatMap((birthday) => {
    if (monthDayKey(birthday.date) !== monthDayKey(dateKey)) {
      return [];
    }

    const age = turningAge(birthday.date, dateKey);
    if (age == null) {
      return [];
    }

    return [{ ...birthday, age }];
  });
}

export function formatBirthdayNames(names: string[]): string {
  if (names.length <= 1) {
    return names[0] ?? "";
  }

  if (names.length === 2) {
    return `${names[0]} og ${names[1]}`;
  }

  return `${names.slice(0, -1).join(", ")} og ${names[names.length - 1]}`;
}
