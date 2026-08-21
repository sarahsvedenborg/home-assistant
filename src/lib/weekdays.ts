export type WeekdayValue =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// Order matters: used to sort the weekly schedule from Monday to Sunday.
export const WEEKDAYS: { value: WeekdayValue; label: string }[] = [
  { value: "monday", label: "Mandag" },
  { value: "tuesday", label: "Tirsdag" },
  { value: "wednesday", label: "Onsdag" },
  { value: "thursday", label: "Torsdag" },
  { value: "friday", label: "Fredag" },
  { value: "saturday", label: "Lørdag" },
  { value: "sunday", label: "Søndag" },
];

export const WEEKDAY_VALUES = WEEKDAYS.map((day) => day.value);

export function weekdayLabel(value: string): string {
  return WEEKDAYS.find((day) => day.value === value)?.label ?? value;
}

export function weekdayOrder(value: string): number {
  const index = WEEKDAY_VALUES.indexOf(value as WeekdayValue);
  return index === -1 ? WEEKDAYS.length : index;
}
