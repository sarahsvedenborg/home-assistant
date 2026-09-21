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
