export type DayNoteCategory = "note" | "birthday";

export const DAY_NOTE_CATEGORIES: {
  value: DayNoteCategory;
  label: string;
}[] = [
  { value: "note", label: "Notat" },
  { value: "birthday", label: "Bursdag" },
];

export const DAY_NOTE_CATEGORY_VALUES = DAY_NOTE_CATEGORIES.map(
  (category) => category.value,
);

export const DEFAULT_DAY_NOTE_CATEGORY: DayNoteCategory = "note";
