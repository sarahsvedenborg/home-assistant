import type { Country } from "@/lib/types";

export const FLAG_QUIZ_COUNTS = [5, 10, 15, 20] as const;
export const FLAG_QUIZ_DEFAULT_COUNT = FLAG_QUIZ_COUNTS[0];
export const FLAG_QUIZ_MAX_QUESTIONS = FLAG_QUIZ_DEFAULT_COUNT;
export const FLAG_QUIZ_CHOICE_COUNT = 4;
export const FLAG_QUIZ_SOURCES = ["studied", "independent", "all"] as const;
export const FLAG_QUIZ_DEFAULT_SOURCE = FLAG_QUIZ_SOURCES[0];

export type FlagQuizCount = (typeof FLAG_QUIZ_COUNTS)[number];
export type FlagQuizSource = (typeof FLAG_QUIZ_SOURCES)[number];

export type FlagQuizQuestion = {
  country: Country;
  choices: Country[];
};

export type FlagQuizOptions = {
  count?: FlagQuizCount;
  source?: FlagQuizSource;
};

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    const swap = copy[swapIndex];

    if (current === undefined || swap === undefined) {
      continue;
    }

    copy[index] = swap;
    copy[swapIndex] = current;
  }

  return copy;
}

export function parseFlagQuizCount(value?: string): FlagQuizCount {
  const parsed = Number(value);

  return FLAG_QUIZ_COUNTS.includes(parsed as FlagQuizCount)
    ? (parsed as FlagQuizCount)
    : FLAG_QUIZ_DEFAULT_COUNT;
}

export function parseFlagQuizSource(value?: string): FlagQuizSource {
  return FLAG_QUIZ_SOURCES.includes(value as FlagQuizSource)
    ? (value as FlagQuizSource)
    : FLAG_QUIZ_DEFAULT_SOURCE;
}

export function getFlagQuizPool(
  source: FlagQuizSource,
  studiedCountries: Country[],
  countries: Country[],
): Country[] {
  if (source === "studied") {
    return studiedCountries;
  }

  if (source === "independent") {
    return countries.filter(
      (country) =>
        country.kind === "independent" || country.kind === "constituent",
    );
  }

  return countries;
}

export function buildFlagQuiz(
  studiedCountries: Country[],
  allCountries: Country[],
  options: FlagQuizOptions = {},
): FlagQuizQuestion[] {
  const count = options.count ?? FLAG_QUIZ_DEFAULT_COUNT;
  const source = options.source ?? FLAG_QUIZ_DEFAULT_SOURCE;
  const pool = getFlagQuizPool(source, studiedCountries, allCountries);
  const uniquePool = [...new Map(pool.map((country) => [country.code, country])).values()];
  const questionCountries = shuffled(uniquePool).slice(0, count);

  return questionCountries.map((country) => {
    const distractors = shuffled(
      uniquePool.filter((candidate) => candidate.code !== country.code),
    ).slice(0, FLAG_QUIZ_CHOICE_COUNT - 1);

    return {
      country,
      choices: shuffled([country, ...distractors]),
    };
  });
}
