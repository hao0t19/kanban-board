"use client";

import { useEffect, useSyncExternalStore, type MouseEvent } from "react";
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

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const next = !dark;
    const root = document.documentElement;
    const apply = () => {
      root.classList.toggle("dark", next);
      try {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      } catch {
        // Storage unavailable; the choice just won't persist.
      }
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition !== "function" || reduceMotion) {
      apply();
      return;
    }

    // Reveal the new theme as a circle growing from the toggle button.
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    // Element color transitions would otherwise keep fading inside the new snapshot.
    root.classList.add("theme-switching");
    const transition = document.startViewTransition(async () => {
      apply();
      // Let the icon re-render (it subscribes to the class change) before the new snapshot.
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    void transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 450, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
    void transition.finished.finally(() => root.classList.remove("theme-switching"));
  };

  return (
    <IconButton aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggle}>
      {dark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
