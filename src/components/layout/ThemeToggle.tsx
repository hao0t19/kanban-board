"use client";

import { useEffect, useSyncExternalStore } from "react";
import { IconButton } from "@/components/ui/Button";
import { MoonIcon, SunIcon } from "@/components/ui/Icons";

export const THEME_KEY = "kanban-theme";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
};

const isDark = () => document.documentElement.classList.contains("dark");

const readStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
};

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  // Follow the system theme until the user picks one manually.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      if (!readStoredTheme()) document.documentElement.classList.toggle("dark", event.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // Storage unavailable; the choice just won't persist.
    }
  };

  return (
    <IconButton aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle}>
      {dark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
