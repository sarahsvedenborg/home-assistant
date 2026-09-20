"use client";

import { useEffect, useState } from "react";

import { applyTheme, THEMES, type ThemeId } from "@/lib/theme";

export function ThemeSwapper() {
  const [theme, setTheme] = useState<ThemeId>("default");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "christmas" || current === "birthday" ? current : "default");
    setIsReady(true);
  }, []);

  function selectTheme(nextTheme: ThemeId) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div className="themeSwapper" role="radiogroup" aria-label="Tema">
      {THEMES.map((option) => {
        const pressed = theme === option.id;

        return (
          <button
            key={option.id}
            type="button"
            className={
              isReady && pressed
                ? "themeSwapperButton themeSwapperButtonActive"
                : "themeSwapperButton"
            }
            role="radio"
            aria-checked={pressed}
            onClick={() => selectTheme(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
