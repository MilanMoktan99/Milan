"use client";

import { useSyncExternalStore } from "react";
import type { ThemeId } from "./theme";

const root = () => document.documentElement;

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(root(), {
    attributes: true,
    attributeFilter: ["data-theme", "data-grid"],
  });
  return () => observer.disconnect();
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    () => (root().dataset.theme ?? "light") as ThemeId,
    () => null,
  );

  const setTheme = (id: ThemeId) => {
    if (root().dataset.theme === id) return;
    root().dataset.theme = id;
    try {
      localStorage.setItem("theme", id);
    } catch {}
  };

  return { theme, setTheme };
}

export function useGrid() {
  const grid = useSyncExternalStore(
    subscribe,
    () => root().dataset.grid === "on",
    () => false,
  );

  const toggleGrid = () => {
    const next = root().dataset.grid === "on" ? "off" : "on";
    root().dataset.grid = next;
    try {
      localStorage.setItem("grid", next);
    } catch {}
  };

  return { grid, toggleGrid };
}
