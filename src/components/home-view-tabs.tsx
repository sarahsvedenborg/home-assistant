"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

type HomeView = "dashboard" | "calendar";

type HomeViewTabsProps = {
  dashboard: ReactNode;
  calendar: ReactNode;
};

export function HomeViewTabs({ dashboard, calendar }: HomeViewTabsProps) {
  const [view, setView] = useState<HomeView>("dashboard");

  return (
    <section className="homeViews" aria-label="Velg startsidevisning">
      <div className="homeViewBar">
        <div className="homeViewTabs" role="tablist" aria-label="Startsidevisning">
          <button
            type="button"
            role="tab"
            id="dashboard-tab"
            aria-controls="dashboard-panel"
            aria-selected={view === "dashboard"}
            className={view === "dashboard" ? "homeViewTab homeViewTabActive" : "homeViewTab"}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            role="tab"
            id="calendar-tab"
            aria-controls="calendar-panel"
            aria-selected={view === "calendar"}
            className={view === "calendar" ? "homeViewTab homeViewTabActive" : "homeViewTab"}
            onClick={() => setView("calendar")}
          >
            Kalender
          </button>
        </div>

        <div className="homeQuickLinks" aria-label="Hurtiglenker">
          <Link href="/forslag" className="homeGhostButton">
            Forslag
          </Link>
          <a href="https://svedenborg.sanity.studio" className="homeGhostButton">
            Admin
          </a>
        </div>
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
        className="homeCalendarPanel"
        role="tabpanel"
        aria-labelledby="calendar-tab"
        hidden={view !== "calendar"}
      >
        {calendar}
      </div>
    </section>
  );
}
