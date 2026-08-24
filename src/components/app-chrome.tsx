"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppChrome() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/test-route") {
    return null;
  }

  const isHome = pathname === "/";
  const isCalendarContext =
    pathname === "/kalender" || pathname === "/aktiviteter";
  const isDashboardContext = pathname === "/ukelonn" || isHome;

  return (
    <header className="appChrome">
      <div className="homeViewBar">
        <nav className="homeViewTabs" aria-label="Hovedvisning">
          <Link
            id="dashboard-tab"
            href="/"
            className={
              isDashboardContext ? "homeViewTab homeViewTabActive" : "homeViewTab"
            }
            aria-current={isDashboardContext ? "page" : undefined}
          >
            Dashboard
          </Link>
          <Link
            id="calendar-tab"
            href="/kalender"
            className={
              isCalendarContext ? "homeViewTab homeViewTabActive" : "homeViewTab"
            }
            aria-current={isCalendarContext ? "page" : undefined}
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
          <Link href="/?view=board" className="homeGhostButton homeContextButton">
            Oppgaver
          </Link>
          <Link href="/ukelonn" className="homeGhostButton homeContextButton">
            Ukelønn
          </Link>
        </nav>
      ) : null}

      {isCalendarContext ? (
        <nav className="homeContextNav" aria-label="Snarveier fra kalender">
          <Link href="/aktiviteter" className="homeGhostButton homeContextButton">
            Faste aktiviteter
          </Link>
          <Link href="/kalender#add-note" className="homeGhostButton homeContextButton">
            Nytt notat
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
