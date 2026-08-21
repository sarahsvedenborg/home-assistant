export type EventCategoryValue = "skole" | "fritid";

export const EVENT_CATEGORIES: { value: EventCategoryValue; label: string }[] = [
  { value: "skole", label: "Skole" },
  { value: "fritid", label: "Fritid" },
];

export const EVENT_CATEGORY_VALUES = EVENT_CATEGORIES.map((category) => category.value);

export const DEFAULT_EVENT_CATEGORY: EventCategoryValue = "skole";

export function eventCategoryLabel(value: string): string {
  return EVENT_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}
