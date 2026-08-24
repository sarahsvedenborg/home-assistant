import type { ReactNode } from "react";

type HomeView = "dashboard" | "board";

type HomeViewTabsProps = {
  dashboard: ReactNode;
  board: ReactNode;
  view?: HomeView;
};

export function HomeViewTabs({
  dashboard,
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
