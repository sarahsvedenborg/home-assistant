import type { ReactNode } from "react";

type HomeView = "dashboard" | "calendar" | "board";

type HomeViewTabsProps = {
  dashboard: ReactNode;
  calendar: ReactNode;
  board: ReactNode;
  view?: HomeView;
};

export function HomeViewTabs({
  dashboard,
  calendar,
  board,
  view = "dashboard",
}: HomeViewTabsProps) {
  return (
    <section className="homeViews" aria-label="Velg startsidevisning">
      <div
        id="dashboard-panel"
        role="region"
        aria-label="Dashboard"
        hidden={view !== "dashboard"}
      >
        {dashboard}
      </div>

      <div
        id="calendar-panel"
        className="homeCalendarPanel"
        role="region"
        aria-label="Kalender"
        hidden={view !== "calendar"}
      >
        {calendar}
      </div>

      <div
        id="board-panel"
        className="homeBoardPanel"
        role="region"
        aria-label="Oppgaver"
        hidden={view !== "board"}
      >
        {board}
      </div>
    </section>
  );
}
