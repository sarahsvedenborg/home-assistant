export type DayNoteCategory = "note" | "birthday" | "vacation" | "holyday";

export const DAY_NOTE_CATEGORIES: {
  value: DayNoteCategory;
  label: string;
}[] = [
  { value: "note", label: "Notat" },
  { value: "birthday", label: "Bursdag" },
  { value: "vacation", label: "Ferie" },
  { value: "holyday", label: "Holyday" },
];

export const DAY_NOTE_CATEGORY_VALUES = DAY_NOTE_CATEGORIES.map(
  (category) => category.value,
);

export const DEFAULT_DAY_NOTE_CATEGORY: DayNoteCategory = "note";
