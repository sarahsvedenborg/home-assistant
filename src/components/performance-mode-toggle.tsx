"use client";

import { useLayoutEffect, useState } from "react";

import {
  isPerformanceLite,
  type PerformanceMode,
  PERFORMANCE_FULL,
  readPerformanceMode,
  applyPerformanceMode,
  togglePerformanceMode,
} from "@/lib/performance-mode";

export function PerformanceModeToggle() {
  const [mode, setMode] = useState<PerformanceMode>(PERFORMANCE_FULL);

  useLayoutEffect(() => {
    const stored = readPerformanceMode();
    applyPerformanceMode(stored);
    setMode(stored);
  }, []);

  const lite = isPerformanceLite(mode);

  return (
    <button
      type="button"
      className={lite ? "homeGhostButton homeGhostButtonActive" : "homeGhostButton"}
      aria-pressed={lite}
      title="Bytter til flate flater uten live sløring. Velg én gang på kiosken."
      onClick={() => {
        setMode((current) => togglePerformanceMode(current));
      }}
    >
      Lett visning
    </button>
  );
}
