import { osloDateKey } from "@/lib/family-feed";
import type { FamilyMember, Reading, ReadingKind, ReadingStatus } from "@/lib/types";

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  wantToRead: "Ønsker å lese",
  reading: "Leser nå",
  finished: "Ferdig",
  abandoned: "Avbrutt",
};

export const READING_TYPE_LABELS: Record<ReadingKind, string> = {
  self: "Selv",
  together: "Sammen",
  audiobook: "Lydbok",
  audioAndText: "Lydbok og tekst",
};

export const READING_TYPE_OPTIONS = (
  Object.entries(READING_TYPE_LABELS) as Array<[ReadingKind, string]>
).map(([value, title]) => ({ value, title }));

export function isReadingStatus(value: string): value is ReadingStatus {
  return value in READING_STATUS_LABELS;
}

export function isReadingKind(value: string): value is ReadingKind {
  return value in READING_TYPE_LABELS;
}

function hasDate(value?: string) {
  return Boolean(value?.trim());
}

export function isCurrentlyReading(reading: Reading) {
  return hasDate(reading.startedAt) && !hasDate(reading.finishedAt);
}

export function isFinishedReading(reading: Reading) {
  return hasDate(reading.finishedAt);
}

export function readingsForMember(readings: Reading[], memberId: string) {
  return readings.filter((reading) =>
    reading.readers.some((reader) => reader.id === memberId),
  );
}

export function currentReadingsForMember(readings: Reading[], memberId: string) {
  return readingsForMember(readings, memberId).filter(isCurrentlyReading);
}

export function bookshelfTitle(name: string) {
  return `${name} sin bokhylle`;
}

export function libraryTitle(name: string) {
  const trimmed = name.trim();
  return /[sxz]$/i.test(trimmed) ? `${trimmed}' bibliotek` : `${trimmed}s bibliotek`;
}

export const LIBRARY_QUOTE = "En ny bok er et nytt eventyr som venter.";

export function osloYear(date = new Date()) {
  return Number(osloDateKey(date).slice(0, 4));
}

export function readingYear(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  return Number(value.slice(0, 4));
}

export function finishedReadingsForMember(readings: Reading[], memberId: string) {
  return readingsForMember(readings, memberId)
    .filter(isFinishedReading)
    .sort(compareFinishedAt);
}

export function finishedReadingsInYear(
  readings: Reading[],
  memberId: string,
  year: number,
) {
  return finishedReadingsForMember(readings, memberId).filter(
    (reading) => readingYear(reading.finishedAt) === year,
  );
}

export function finishedReadingYears(readings: Reading[], memberId: string) {
  const years = new Set<number>([osloYear()]);

  for (const reading of finishedReadingsForMember(readings, memberId)) {
    const year = readingYear(reading.finishedAt);
    if (year) {
      years.add(year);
    }
  }

  return [...years].sort((left, right) => right - left);
}

export function defaultFinishedYear(readings: Reading[], memberId: string) {
  const latest = finishedReadingsForMember(readings, memberId)[0];
  return readingYear(latest?.finishedAt) ?? osloYear();
}

export function otherReaderNames(reading: Reading, memberId: string) {
  return reading.readers
    .filter((reader) => reader.id !== memberId)
    .map((reader) => reader.name);
}

export function formatReaderList(names: string[]) {
  if (names.length === 0) {
    return "";
  }

  if (names.length === 1) {
    return names[0];
  }

  return `${names.slice(0, -1).join(", ")} og ${names.at(-1)}`;
}

export function readingProgressLabel(reading: Reading) {
  if (typeof reading.currentPage !== "number") {
    return null;
  }

  if (typeof reading.book.pageCount === "number" && reading.book.pageCount > 0) {
    return `Side ${reading.currentPage} av ${reading.book.pageCount}`;
  }

  return `Side ${reading.currentPage}`;
}

export function readingProgressPercent(reading: Reading) {
  if (
    typeof reading.currentPage !== "number" ||
    typeof reading.book.pageCount !== "number" ||
    reading.book.pageCount <= 0
  ) {
    return null;
  }

  return Math.min(100, Math.round((reading.currentPage / reading.book.pageCount) * 100));
}

export function formatReadingDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function compareFinishedAt(a: Reading, b: Reading) {
  return (b.finishedAt || "").localeCompare(a.finishedAt || "");
}

export function groupedBookshelf(readings: Reading[], member: FamilyMember) {
  const memberReadings = readingsForMember(readings, member.id);
  const currentReadings = memberReadings.filter(isCurrentlyReading);
  const finishedReadings = memberReadings
    .filter(isFinishedReading)
    .sort(compareFinishedAt);
  const placedIds = new Set(
    [...currentReadings, ...finishedReadings].map((reading) => reading.id),
  );

  return [
    {
      status: "reading" as const,
      label: READING_STATUS_LABELS.reading,
      readings: currentReadings,
    },
    {
      status: "wantToRead" as const,
      label: READING_STATUS_LABELS.wantToRead,
      readings: memberReadings.filter(
        (reading) =>
          !placedIds.has(reading.id) && reading.status !== "abandoned",
      ),
    },
    {
      status: "finished" as const,
      label: READING_STATUS_LABELS.finished,
      readings: finishedReadings,
    },
    {
      status: "abandoned" as const,
      label: READING_STATUS_LABELS.abandoned,
      readings: memberReadings.filter(
        (reading) =>
          !placedIds.has(reading.id) && reading.status === "abandoned",
      ),
    },
  ];
}
