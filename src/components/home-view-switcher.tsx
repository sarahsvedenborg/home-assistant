"use client";

import { useEffect, useState, type ReactNode } from "react";

type HomeView = "dashboard" | "calendar";

type HomeViewSwitcherProps = {
  initialView: HomeView;
  dashboard: ReactNode;
  calendar: ReactNode;
};

function viewFromUrl(): HomeView {
  return new URL(window.location.href).searchParams.get("view") === "calendar"
    ? "calendar"
    : "dashboard";
}

export function HomeViewSwitcher({
  initialView,
  dashboard,
  calendar,
}: HomeViewSwitcherProps) {
  const [view, setView] = useState<HomeView>(initialView);

  useEffect(() => {
    function syncViewFromHistory() {
      setView(viewFromUrl());
    }

    window.addEventListener("popstate", syncViewFromHistory);
    return () => window.removeEventListener("popstate", syncViewFromHistory);
  }, []);

  function selectView(nextView: HomeView) {
    const url = new URL(window.location.href);

    if (nextView === "calendar") {
      url.searchParams.set("view", "calendar");
    } else {
      url.searchParams.delete("view");
    }

    window.history.pushState(null, "", url);
    setView(nextView);
  }

  return (
    <section className="homeViews" aria-label="Velg startsidevisning">
      <div className="homeViewTabs" role="tablist" aria-label="Startsidevisning">
        <button
          type="button"
          role="tab"
          id="dashboard-tab"
          aria-controls="dashboard-panel"
          aria-selected={view === "dashboard"}
          className={view === "dashboard" ? "homeViewTab homeViewTabActive" : "homeViewTab"}
          onClick={() => selectView("dashboard")}
        >
          Oversikt
        </button>
        <button
          type="button"
          role="tab"
          id="calendar-tab"
          aria-controls="calendar-panel"
          aria-selected={view === "calendar"}
          className={view === "calendar" ? "homeViewTab homeViewTabActive" : "homeViewTab"}
          onClick={() => selectView("calendar")}
        >
          Kalender
        </button>
      </div>

      <div
        id="dashboard-panel"
        role="tabpanel"
        aria-labelledby="dashboard-tab"
        hidden={view !== "dashboard"}
      >
        {dashboard}
      </div>
      <div
        id="calendar-panel"
        role="tabpanel"
        aria-labelledby="calendar-tab"
        hidden={view !== "calendar"}
      >
        {calendar}
      </div>
    </section>
  );
}
