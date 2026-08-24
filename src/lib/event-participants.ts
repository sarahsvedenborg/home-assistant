export const EVENT_PARTICIPANT_ALL = "all";
export const EVENT_PARTICIPANT_ADULTS = "parents";

export const EVENT_PARTICIPANT_GROUPS = [
  { value: EVENT_PARTICIPANT_ADULTS, label: "Voksne" },
  { value: EVENT_PARTICIPANT_ALL, label: "Alle" },
] as const;

export function eventParticipantLabel(value: string): string {
  if (value === EVENT_PARTICIPANT_ALL) {
    return "Alle";
  }

  if (value === EVENT_PARTICIPANT_ADULTS) {
    return "Voksne";
  }

  return value;
}
