export type SingleEventCategoryValue = "ak" | "filmkveld" | "spillkveld";

export const SINGLE_EVENT_CATEGORIES: {
  value: SingleEventCategoryValue;
  label: string;
}[] = [
  { value: "ak", label: "AK" },
  { value: "filmkveld", label: "Filmkveld" },
  { value: "spillkveld", label: "Spillkveld" },
];

export const SINGLE_EVENT_CATEGORY_VALUES = SINGLE_EVENT_CATEGORIES.map(
  (category) => category.value,
);

export const DEFAULT_SINGLE_EVENT_CATEGORY: SingleEventCategoryValue = "ak";

export function singleEventCategoryLabel(value: string): string {
  const legacyLabels: Record<string, string> = {
    bursdag: "Bursdag",
    avtale: "Avtale",
    tur: "Tur",
    annet: "Annet",
  };

  return (
    SINGLE_EVENT_CATEGORIES.find((category) => category.value === value)?.label ??
    legacyLabels[value] ??
    value
  );
}
