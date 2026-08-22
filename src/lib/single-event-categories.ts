export type SingleEventCategoryValue = "bursdag" | "avtale" | "tur" | "annet";

export const SINGLE_EVENT_CATEGORIES: {
  value: SingleEventCategoryValue;
  label: string;
}[] = [
  { value: "bursdag", label: "Bursdag" },
  { value: "avtale", label: "Avtale" },
  { value: "tur", label: "Tur" },
  { value: "annet", label: "Annet" },
];

export const SINGLE_EVENT_CATEGORY_VALUES = SINGLE_EVENT_CATEGORIES.map(
  (category) => category.value,
);

export const DEFAULT_SINGLE_EVENT_CATEGORY: SingleEventCategoryValue = "annet";

export function singleEventCategoryLabel(value: string): string {
  return (
    SINGLE_EVENT_CATEGORIES.find((category) => category.value === value)?.label ?? value
  );
}
