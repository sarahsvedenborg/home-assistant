export const PERFORMANCE_STORAGE_KEY = "family-hub-performance";
export const PERFORMANCE_LITE = "lite";
export const PERFORMANCE_FULL = "full";

export type PerformanceMode = typeof PERFORMANCE_LITE | typeof PERFORMANCE_FULL;

export const PERFORMANCE_ATTRIBUTE = "data-performance";

/** Inline boot script: apply the stored preference before first paint. */
export const PERFORMANCE_BOOT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(PERFORMANCE_STORAGE_KEY)})===${JSON.stringify(PERFORMANCE_LITE)}){document.documentElement.setAttribute(${JSON.stringify(PERFORMANCE_ATTRIBUTE)},${JSON.stringify(PERFORMANCE_LITE)});}}catch(e){}})();`;

export function isPerformanceLite(mode: PerformanceMode): boolean {
  return mode === PERFORMANCE_LITE;
}

export function readPerformanceMode(): PerformanceMode {
  try {
    return window.localStorage.getItem(PERFORMANCE_STORAGE_KEY) === PERFORMANCE_LITE
      ? PERFORMANCE_LITE
      : PERFORMANCE_FULL;
  } catch {
    return PERFORMANCE_FULL;
  }
}

export function applyPerformanceMode(mode: PerformanceMode): void {
  const root = document.documentElement;

  if (mode === PERFORMANCE_LITE) {
    root.setAttribute(PERFORMANCE_ATTRIBUTE, PERFORMANCE_LITE);
    return;
  }

  root.removeAttribute(PERFORMANCE_ATTRIBUTE);
}

export function persistPerformanceMode(mode: PerformanceMode): void {
  try {
    if (mode === PERFORMANCE_LITE) {
      window.localStorage.setItem(PERFORMANCE_STORAGE_KEY, PERFORMANCE_LITE);
    } else {
      window.localStorage.removeItem(PERFORMANCE_STORAGE_KEY);
    }
  } catch {
    // Private mode or a full quota still gets the in-session attribute.
  }

  applyPerformanceMode(mode);
}

export function togglePerformanceMode(mode: PerformanceMode): PerformanceMode {
  const next = mode === PERFORMANCE_LITE ? PERFORMANCE_FULL : PERFORMANCE_LITE;
  persistPerformanceMode(next);
  return next;
}
