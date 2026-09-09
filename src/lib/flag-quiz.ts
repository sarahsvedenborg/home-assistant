import type { Country } from "@/lib/types";

export const FLAG_QUIZ_MAX_QUESTIONS = 5;
export const FLAG_QUIZ_CHOICE_COUNT = 4;

export type FlagQuizQuestion = {
  country: Country;
  choices: Country[];
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

export function buildFlagQuiz(
  studiedCountries: Country[],
  allCountries: Country[],
): FlagQuizQuestion[] {
  const uniqueStudied = [
    ...new Map(studiedCountries.map((country) => [country.code, country])).values(),
  ];
  const questionCountries = shuffled(uniqueStudied).slice(
    0,
    FLAG_QUIZ_MAX_QUESTIONS,
  );

  return questionCountries.map((country) => {
    const distractors = shuffled(
      allCountries.filter((candidate) => candidate.code !== country.code),
    ).slice(0, FLAG_QUIZ_CHOICE_COUNT - 1);

    return {
      country,
      choices: shuffled([country, ...distractors]),
    };
  });
}
