export const THEME_STORAGE_KEY = "family-hub-theme";

export const THEMES = [
  { id: "default", label: "Vanlig" },
  { id: "christmas", label: "Jul" },
  { id: "birthday", label: "Bursdag" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return THEMES.some((theme) => theme.id === value);
}

export function applyTheme(theme: ThemeId) {
  if (theme === "default") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function readStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : "default";
  } catch {
    return "default";
  }
}
