export const MOVIE_AUDIENCES = [
  { value: "De voksne", label: "De voksne" },
  { value: "Storbarna", label: "Storbarna" },
  { value: "Med Linnea", label: "Med Linnea" },
  { value: "Hele familien", label: "Hele familien" },
] as const;

export type MovieAudience = (typeof MOVIE_AUDIENCES)[number]["value"];

export const MOVIE_AUDIENCE_VALUES = MOVIE_AUDIENCES.map(
  (audience) => audience.value,
);

export function isMovieAudience(value: string): value is MovieAudience {
  return MOVIE_AUDIENCE_VALUES.includes(value as MovieAudience);
}
