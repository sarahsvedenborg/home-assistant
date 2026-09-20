export type DayNoteCategory = "note" | "birthday" | "vacation" | "holyday" | "prove";

export const DAY_NOTE_CATEGORIES: {
  value: DayNoteCategory;
  label: string;
}[] = [
  { value: "note", label: "Notat" },
  { value: "vacation", label: "Ferie" },
  { value: "holyday", label: "Holyday" },
  { value: "prove", label: "Prøve" },
];

export const DAY_NOTE_CATEGORY_VALUES = DAY_NOTE_CATEGORIES.map(
  (category) => category.value,
);

export const DEFAULT_DAY_NOTE_CATEGORY: DayNoteCategory = "note";
