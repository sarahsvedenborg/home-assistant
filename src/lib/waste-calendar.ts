import "server-only";

import { unstable_cache } from "next/cache";

import type { WastePickup, WastePickupNote } from "@/lib/types";

// ØRAS publishes collection days through a WordPress AJAX action on
// https://www.oeras.no/mitt-abonnement/tommetider/. There is no documented API.
// Verified 2026-10-23 against admin-ajax.php:
//   action=minrenovasjon_get_fractions&kommunenr=3209
//     -> { success, data: [{ id, navn, ... }] }
//   action=minrenovasjon_get_calendar&kommunenr&gatenavn&gatekode&husnr
//     -> { success, data: [{ fraksjonId, tommedatoer: ["2026-10-29T00:00:00", ...] }] }
// The calendar action returns only the next few dates per fraction (two, on the
// day it was checked) and ignores extra date-range parameters. A full year is
// the separate PDF action, which this module does not call.
// Responses are sent with `cache-control: no-store, private` and `x-robots-tag:
// noindex`. We cache one household server-side for 24 hours and do not accept
// an address from the request.

const OERAS_AJAX_URL = "https://www.oeras.no/wp-admin/admin-ajax.php";
const CACHE_SECONDS = 86400;

// Ullensaker / Kløfta, same household as the MET forecast in data.ts.
// VegAdresseId 32090800000110: kommunenr is the first 4 digits, gatekode the next 5.
const WASTE_ADDRESS = {
  kommunenr: "3209",
  gatenavn: "Movegen",
  gatekode: "08000",
  husnr: "11",
} as const;

const UNKNOWN_FRACTION = "Ukjent avfallstype";

const WASTE_NOTE_LABELS: Array<[RegExp, string, string]> = [
  [/plast/i, "Tømmedag plast", "♻️"],
  [/papir|papp/i, "Tømmedag papir", "📄"],
  [/glass|metall/i, "Tømmedag glass og metall", "🫙"],
  [/mat|rest/i, "Tømmedag mat og rest", "🗑️"],
  [/tekstil|klær/i, "Tømmedag tekstil", "👕"],
];

function wastePickupNote(type: string): { name: string; emoji: string } {
  const match = WASTE_NOTE_LABELS.find(([pattern]) => pattern.test(type));
  if (match) {
    return { name: match[1], emoji: match[2] };
  }

  const fallback = type.replace(/\s+/g, " ").trim().toLowerCase();
  return {
    name: fallback ? `Tømmedag ${fallback}` : "Tømmedag",
    emoji: "🗑️",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }

  return null;
}

function readSuccessData(payload: unknown): unknown {
  if (!isRecord(payload) || payload.success !== true || !("data" in payload)) {
    throw new Error("ØRAS returned an unsuccessful calendar response.");
  }

  return payload.data;
}

function cleanFractionName(name: string): string {
  const cleaned = name.replace(/\s+-\s*$/, "").replace(/\s+/g, " ").trim();
  return cleaned || UNKNOWN_FRACTION;
}

function toDateKey(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function fractionNames(data: unknown): Map<number, string> {
  if (!Array.isArray(data)) {
    throw new Error("ØRAS fraction list had an unexpected shape.");
  }

  const names = new Map<number, string>();

  for (const entry of data) {
    if (!isRecord(entry)) {
      continue;
    }

    const id = readInteger(entry.id ?? entry.Id);
    const name = entry.navn ?? entry.Navn;
    if (id === null || typeof name !== "string") {
      continue;
    }

    names.set(id, cleanFractionName(name));
  }

  if (names.size === 0) {
    throw new Error("ØRAS fraction list was empty.");
  }

  return names;
}

function normalizeWastePickups(
  fractions: unknown,
  calendar: unknown,
): WastePickup[] {
  const names = fractionNames(fractions);

  if (!Array.isArray(calendar)) {
    throw new Error("ØRAS calendar had an unexpected shape.");
  }

  const seen = new Set<string>();
  const pickups: WastePickup[] = [];

  for (const entry of calendar) {
    if (!isRecord(entry)) {
      continue;
    }

    const fractionId = readInteger(entry.fraksjonId ?? entry.FraksjonId);
    const dates = entry.tommedatoer ?? entry.Tommedatoer;
    if (fractionId === null || !Array.isArray(dates)) {
      continue;
    }

    const type = names.get(fractionId) ?? UNKNOWN_FRACTION;

    for (const dateValue of dates) {
      if (typeof dateValue !== "string") {
        continue;
      }

      const date = toDateKey(dateValue);
      if (!date) {
        continue;
      }

      const key = `${date}\0${type}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      pickups.push({ date, type });
    }
  }

  pickups.sort((left, right) => {
    const byDate = left.date.localeCompare(right.date);
    if (byDate !== 0) {
      return byDate;
    }

    return left.type.localeCompare(right.type, "nb");
  });

  return pickups;
}

async function oerasGet(params: Record<string, string>): Promise<unknown> {
  const url = new URL(OERAS_AJAX_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "family-hub/1.0 (https://github.com/sarahsvedenborg/home-assistant)",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`ØRAS responded with ${response.status}.`);
  }

  return response.json();
}

async function loadWastePickups(): Promise<WastePickup[]> {
  const [fractionsPayload, calendarPayload] = await Promise.all([
    oerasGet({
      action: "minrenovasjon_get_fractions",
      kommunenr: WASTE_ADDRESS.kommunenr,
    }),
    oerasGet({
      action: "minrenovasjon_get_calendar",
      kommunenr: WASTE_ADDRESS.kommunenr,
      gatenavn: WASTE_ADDRESS.gatenavn,
      gatekode: WASTE_ADDRESS.gatekode,
      husnr: WASTE_ADDRESS.husnr,
    }),
  ]);

  return normalizeWastePickups(
    readSuccessData(fractionsPayload),
    readSuccessData(calendarPayload),
  );
}

// Cached independently of the route. The API route reads the auth cookie first,
// and Next does not cache fetch calls that happen after request data is read.
export const getWastePickups = unstable_cache(loadWastePickups, ["oeras-waste-calendar"], {
  revalidate: CACHE_SECONDS,
});

export async function getWastePickupNotes(): Promise<WastePickupNote[]> {
  try {
    const pickups = await getWastePickups();
    const seen = new Set<string>();
    const notes: WastePickupNote[] = [];

    for (const pickup of pickups) {
      const { name, emoji } = wastePickupNote(pickup.type);
      const key = `${pickup.date}\0${name}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      notes.push({ date: pickup.date, name, emoji });
    }

    return notes;
  } catch {
    return [];
  }
}
