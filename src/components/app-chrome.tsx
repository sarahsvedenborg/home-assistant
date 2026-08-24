"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function AppChrome() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === "/login" || pathname === "/test-route") {
    return null;
  }

  const isHome = pathname === "/";
  const isBoardPage = isHome && searchParams.get("view") === "board";
  const isDashboardPage = isHome && !isBoardPage;
  const isWeeklyPayPage = pathname === "/ukelonn";
  const isCalendarPage = pathname === "/kalender";
  const isActivitiesPage = pathname === "/aktiviteter";
  const isCalendarContext =
    isCalendarPage || isActivitiesPage;
  const isDashboardContext = isWeeklyPayPage || isHome;

  return (
    <header className="appChrome">
      <div className="homeViewBar">
        <nav className="homeViewTabs" aria-label="Hovedvisning">
          <Link
            id="dashboard-tab"
            href="/"
            className={
              isDashboardPage ? "homeViewTab homeViewTabActive" : "homeViewTab"
            }
            aria-current={isDashboardPage ? "page" : undefined}
          >
            Dashboard
          </Link>
          <Link
            id="calendar-tab"
            href="/kalender"
            className={
              isCalendarPage ? "homeViewTab homeViewTabActive" : "homeViewTab"
            }
            aria-current={isCalendarPage ? "page" : undefined}
          >
            Kalender
          </Link>
        </nav>

        <nav className="homeQuickLinks" aria-label="Hurtiglenker">
          <Link href="/forslag" className="homeGhostButton">
            Forslag
          </Link>
          <a href="https://svedenborg.sanity.studio" className="homeGhostButton">
            Admin
          </a>
        </nav>
      </div>

      {isDashboardContext ? (
        <nav className="homeContextNav" aria-label="Snarveier fra dashboard">
          <Link
            href="/?view=board"
            className={
              isBoardPage
                ? "homeGhostButton homeContextButton homeContextButtonActive"
                : "homeGhostButton homeContextButton"
            }
            aria-current={isBoardPage ? "page" : undefined}
          >
            Oppgaver
          </Link>
          <Link
            href="/ukelonn"
            className={
              isWeeklyPayPage
                ? "homeGhostButton homeContextButton homeContextButtonActive"
                : "homeGhostButton homeContextButton"
            }
            aria-current={isWeeklyPayPage ? "page" : undefined}
          >
            Ukelønn
          </Link>
        </nav>
      ) : null}

      {isCalendarContext ? (
        <nav className="homeContextNav" aria-label="Snarveier fra kalender">
          <Link
            href="/aktiviteter"
            className={
              isActivitiesPage
                ? "homeGhostButton homeContextButton homeContextButtonActive"
                : "homeGhostButton homeContextButton"
            }
            aria-current={isActivitiesPage ? "page" : undefined}
          >
            Faste aktiviteter
          </Link>
          <Link
            href="/kalender#add-note"
            className="homeGhostButton homeContextButton homeContextButtonAction"
            onClick={(event) => {
              if (isCalendarPage) {
                event.preventDefault();
                window.location.hash = "add-note";
              }
            }}
          >
            + Nytt notat
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
