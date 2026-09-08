import "server-only";

import type { Country } from "@/lib/types";

const FLAGCDN_CODES_URL = "https://flagcdn.com/no/codes.json";
const COUNTRY_FACTS_URL =
  "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json";
const SKIPPED_CODES = new Set(["eu", "un"]);

const CONTINENT_LABELS: Record<string, string> = {
  Africa: "Afrika",
  Americas: "Amerika",
  Antarctic: "Antarktis",
  Asia: "Asia",
  Europe: "Europa",
  Oceania: "Oseania",
};

type CountryFacts = {
  capital?: string;
  continent?: string;
};

type SourceCountry = {
  cca2?: unknown;
  capital?: unknown;
  region?: unknown;
};

const FALLBACK_COUNTRIES: Country[] = [
  countryFromCode("no", "Norge", { capital: "Oslo", continent: "Europa" }),
  countryFromCode("se", "Sverige", { capital: "Stockholm", continent: "Europa" }),
  countryFromCode("dk", "Danmark", { capital: "København", continent: "Europa" }),
  countryFromCode("fi", "Finland", { capital: "Helsingfors", continent: "Europa" }),
  countryFromCode("is", "Island", { capital: "Reykjavík", continent: "Europa" }),
  countryFromCode("de", "Tyskland", { capital: "Berlin", continent: "Europa" }),
  countryFromCode("fr", "Frankrike", { capital: "Paris", continent: "Europa" }),
  countryFromCode("gb", "Storbritannia", {
    capital: "London",
    continent: "Europa",
  }),
  countryFromCode("us", "USA", { capital: "Washington, D.C.", continent: "Amerika" }),
  countryFromCode("jp", "Japan", { capital: "Tokyo", continent: "Asia" }),
];

function countryFromCode(
  code: string,
  name: string,
  facts: CountryFacts = {},
): Country {
  const normalized = code.toLowerCase();

  return {
    code: normalized,
    name,
    flagUrl: `https://flags.restcountries.com/v5/w640/${normalized}.png`,
    flagSvgUrl: `https://flagcdn.com/${normalized}.svg`,
    mapUrl: `https://borderly.dev/country/${normalized}.svg`,
    capital: facts.capital,
    continent: facts.continent,
  };
}

function isIsoCountryCode(code: string): boolean {
  return /^[a-z]{2}$/.test(code) && !SKIPPED_CODES.has(code);
}

function firstString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    const trimmed = value[0].trim();
    return trimmed ? trimmed : undefined;
  }

  return undefined;
}

async function fetchJson(url: string, timeoutMs = 4000): Promise<unknown> {
  const response = await fetch(url, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function getCountryFacts(): Promise<Map<string, CountryFacts>> {
  const facts = new Map<string, CountryFacts>();

  try {
    const data = await fetchJson(COUNTRY_FACTS_URL, 8000);
    if (!Array.isArray(data)) {
      return facts;
    }

    for (const entry of data as SourceCountry[]) {
      if (typeof entry.cca2 !== "string") {
        continue;
      }

      const code = entry.cca2.toLowerCase();
      if (!isIsoCountryCode(code)) {
        continue;
      }

      const capital = firstString(entry.capital);
      const continent = firstString(entry.region);
      facts.set(code, {
        capital,
        continent: continent ? CONTINENT_LABELS[continent] || continent : undefined,
      });
    }
  } catch {
    return facts;
  }

  return facts;
}

export async function getCountries(): Promise<Country[]> {
  try {
    const [namesData, facts] = await Promise.all([
      fetchJson(FLAGCDN_CODES_URL),
      getCountryFacts(),
    ]);

    if (!namesData || typeof namesData !== "object" || Array.isArray(namesData)) {
      return FALLBACK_COUNTRIES;
    }

    const countries = Object.entries(namesData as Record<string, unknown>)
      .flatMap(([code, name]) => {
        if (typeof name !== "string" || !isIsoCountryCode(code)) {
          return [];
        }

        const trimmedName = name.trim();
        if (!trimmedName || trimmedName.length > 80) {
          return [];
        }

        return [countryFromCode(code, trimmedName, facts.get(code))];
      })
      .sort((left, right) => left.name.localeCompare(right.name, "nb"));

    return countries.length > 0 ? countries : FALLBACK_COUNTRIES;
  } catch {
    return FALLBACK_COUNTRIES;
  }
}

export function getDailyCountry(countries: Country[], dateKey: string): Country | null {
  if (countries.length === 0) {
    return null;
  }

  const dateNumber = Number(dateKey.replaceAll("-", ""));
  const index = Number.isFinite(dateNumber)
    ? dateNumber % countries.length
    : 0;

  return countries[index];
}
