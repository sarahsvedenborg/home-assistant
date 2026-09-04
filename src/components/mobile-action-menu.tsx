"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

type MobileAction = {
  label: string;
  icon: string;
  path: string;
  anchor: string;
  primary?: boolean;
};

const ACTIONS: MobileAction[] = [
  {
    label: "Notat",
    icon: "📝",
    path: "/kalender",
    anchor: "add-note",
  },
  {
    label: "Aktivitet",
    icon: "🔁",
    path: "/aktiviteter",
    anchor: "add-activity",
  },
  {
    label: "Hendelse",
    icon: "+",
    path: "/kalender",
    anchor: "add-event",
    primary: true,
  },
  {
    label: "Melding",
    icon: "💬",
    path: "/meldinger",
    anchor: "add-message",
  },
  {
    label: "Handleliste",
    icon: "🛒",
    path: "/handleliste",
    anchor: "add-item",
  },
] as const;

export function MobileActionMenu() {
  const pathname = usePathname();

  if (
    pathname === "/login" ||
    pathname === "/test-route" ||
    pathname.startsWith("/studio")
  ) {
    return null;
  }

  function openOnCurrentPage(
    event: MouseEvent<HTMLAnchorElement>,
    path: string,
    anchor: string,
  ) {
    if (pathname !== path) {
      return;
    }

    event.preventDefault();
    window.history.replaceState(null, "", `${path}#${anchor}`);
    window.dispatchEvent(new Event("hashchange"));
  }

  return (
    <nav className="mobileActionMenu" aria-label="Legg til">
      {ACTIONS.map((action) => (
        <Link
          href={`${action.path}#${action.anchor}`}
          className={
            action.primary
              ? "mobileActionItem mobileActionItemPrimary"
              : "mobileActionItem"
          }
          onClick={(event) =>
            openOnCurrentPage(event, action.path, action.anchor)
          }
          key={action.label}
        >
          <span className="mobileActionIcon" aria-hidden="true">
            {action.icon}
          </span>
          <span>{action.label}</span>
        </Link>
      ))}
    </nav>
  );
}
