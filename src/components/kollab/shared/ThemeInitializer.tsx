"use client";

import { useEffect } from "react";
import type { AppearanceMode } from "@/types/artist";

const storageKey = "kollab-theme";

function isAppearanceMode(value: string | null): value is AppearanceMode {
  return value === "light" || value === "dark";
}

export function setKollabTheme(mode: AppearanceMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  window.localStorage.setItem(storageKey, mode);
}

export function ThemeInitializer() {
  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);

    if (isAppearanceMode(storedTheme)) {
      setKollabTheme(storedTheme);
    }
  }, []);

  return null;
}
