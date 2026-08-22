import type { BoardIssueStatus } from "@/lib/types";

export const BOARD_STATUS_VALUES = ["todo", "inProgress", "done"] as const;

export const BOARD_COLUMNS: Array<{
  value: BoardIssueStatus;
  label: string;
}> = [
  { value: "todo", label: "Må gjøres" },
  { value: "inProgress", label: "Har begynt" },
  { value: "done", label: "Ferdig" },
];
