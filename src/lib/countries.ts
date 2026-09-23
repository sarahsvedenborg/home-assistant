import "server-only";

import { isFlagCode } from "@/lib/flag-codes";
import type { Country, CountryKind } from "@/lib/types";

const FLAGCDN_CODES_URL = "https://flagcdn.com/no/codes.json";
const COUNTRY_FACTS_URL =
  "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json";
const EXTRA_FLAG_CODES = ["gb-eng", "gb-sct", "gb-wls"] as const;
const SHARED_FLAG_TERRITORIES = new Set(["bv", "mf", "sj", "um"]);
const TERRITORY_PARENTS: Record<string, string> = {
  ai: "Storbritannia",
  as: "USA",
  aw: "Nederland",
  ax: "Finland",
  bl: "Frankrike",
  bm: "Storbritannia",
  bq: "Nederland",
  cc: "Australia",
  ck: "New Zealand",
  cw: "Nederland",
  cx: "Australia",
  fk: "Storbritannia",
  fo: "Danmark",
  gf: "Frankrike",
  gg: "Storbritannia",
  gi: "Storbritannia",
  gl: "Danmark",
  gp: "Frankrike",
  gs: "Storbritannia",
  gu: "USA",
  hk: "Kina",
  hm: "Australia",
  im: "Storbritannia",
  io: "Storbritannia",
  je: "Storbritannia",
  ky: "Storbritannia",
  mo: "Kina",
  mp: "USA",
  mq: "Frankrike",
  ms: "Storbritannia",
  nc: "Frankrike",
  nf: "Australia",
  nu: "New Zealand",
  pf: "Frankrike",
  pm: "Frankrike",
  pn: "Storbritannia",
  pr: "USA",
  re: "Frankrike",
  sh: "Storbritannia",
  sx: "Nederland",
  tc: "Storbritannia",
  tf: "Frankrike",
  tk: "New Zealand",
  vg: "Storbritannia",
  vi: "USA",
  wf: "Frankrike",
  yt: "Frankrike",
};

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
  independent?: boolean;
  kind?: CountryKind;
  partOf?: string;
};

const EXTRA_FLAG_FACTS: Record<string, CountryFacts> = {
  "gb-eng": {
    capital: "London",
    continent: "Europa",
    independent: false,
    kind: "constituent",
    partOf: "Storbritannia",
  },
  "gb-sct": {
    capital: "Edinburgh",
    continent: "Europa",
    independent: false,
    kind: "constituent",
    partOf: "Storbritannia",
  },
  "gb-wls": {
    capital: "Cardiff",
    continent: "Europa",
    independent: false,
    kind: "constituent",
    partOf: "Storbritannia",
  },
};

type SourceCountry = {
  cca2?: unknown;
  capital?: unknown;
  region?: unknown;
  independent?: unknown;
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
    flagUrl: `https://flagcdn.com/w640/${normalized}.png`,
    flagSvgUrl: `https://flagcdn.com/${normalized}.svg`,
    mapUrl: `https://borderly.dev/country/${normalized}.svg`,
    capital: facts.capital,
    continent: facts.continent,
    independent: facts.independent ?? true,
    kind: facts.kind ?? "independent",
    partOf: facts.partOf,
  };
}

function isIsoCountryCode(code: string): boolean {
  return /^[a-z]{2}$/.test(code);
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

async function getCountrySource(): Promise<{
  facts: Map<string, CountryFacts>;
  independentCodes: Set<string>;
  territoryCodes: Set<string>;
}> {
  const facts = new Map<string, CountryFacts>();
  const independentCodes = new Set<string>();
  const territoryCodes = new Set<string>();

  try {
    const data = await fetchJson(COUNTRY_FACTS_URL, 8000);
    if (!Array.isArray(data)) {
      return { facts, independentCodes, territoryCodes };
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
      const baseFacts: CountryFacts = {
        capital,
        continent: continent ? CONTINENT_LABELS[continent] || continent : undefined,
      };

      if (entry.independent === true) {
        independentCodes.add(code);
        facts.set(code, { ...baseFacts, independent: true, kind: "independent" });
        continue;
      }

      if (!SHARED_FLAG_TERRITORIES.has(code)) {
        territoryCodes.add(code);
        facts.set(code, {
          ...baseFacts,
          independent: false,
          kind: "territory",
          partOf: TERRITORY_PARENTS[code],
        });
      }
    }
  } catch {
    return { facts, independentCodes, territoryCodes };
  }

  return { facts, independentCodes, territoryCodes };
}

export async function getCountries(): Promise<Country[]> {
  try {
    const [namesData, source] = await Promise.all([
      fetchJson(FLAGCDN_CODES_URL),
      getCountrySource(),
    ]);

    if (!namesData || typeof namesData !== "object" || Array.isArray(namesData)) {
      return FALLBACK_COUNTRIES;
    }

    if (source.independentCodes.size === 0) {
      return FALLBACK_COUNTRIES;
    }

    const allowedCodes = new Set<string>([
      ...source.independentCodes,
      ...source.territoryCodes,
      ...EXTRA_FLAG_CODES,
    ]);

    const countries = Object.entries(namesData as Record<string, unknown>)
      .flatMap(([code, name]) => {
        const normalized = code.toLowerCase();
        if (typeof name !== "string" || !allowedCodes.has(normalized) || !isFlagCode(normalized)) {
          return [];
        }

        const trimmedName = name.trim();
        if (!trimmedName || trimmedName.length > 80) {
          return [];
        }

        return [
          countryFromCode(
            normalized,
            trimmedName,
            EXTRA_FLAG_FACTS[normalized] || source.facts.get(normalized),
          ),
        ];
      })
      .sort((left, right) => {
        const kindOrder = { independent: 0, constituent: 1, territory: 2 };
        if (kindOrder[left.kind] !== kindOrder[right.kind]) {
          return kindOrder[left.kind] - kindOrder[right.kind];
        }

        return left.name.localeCompare(right.name, "nb");
      });

    return countries.length > 0 ? countries : FALLBACK_COUNTRIES;
  } catch {
    return FALLBACK_COUNTRIES;
  }
}

export function getIndependentCountries(countries: Country[]): Country[] {
  return countries.filter((country) => country.independent);
}

export function getDailyCountry(countries: Country[], dateKey: string): Country | null {
  const pool = getIndependentCountries(countries);

  if (pool.length === 0) {
    return null;
  }

  const dateNumber = Number(dateKey.replaceAll("-", ""));
  const index = Number.isFinite(dateNumber)
    ? dateNumber % pool.length
    : 0;

  return pool[index];
}
