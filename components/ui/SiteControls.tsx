"use client";

import { useGrid } from "@/lib/preferences";
import { ThemeControl } from "./ThemeControl";
import { GridIcon } from "./icons";

export function SiteControls() {
  const { grid, toggleGrid } = useGrid();

  return (
    <div className="fixed bottom-6 left-(--grid-margin) z-50 flex flex-col items-center gap-3">
      <ThemeControl />

      <button
        type="button"
        onClick={toggleGrid}
        aria-pressed={grid}
        aria-label="Show layout grid"
        className="grid size-12 place-items-center rounded-full bg-fg/10 text-fg backdrop-blur transition-colors hover:bg-fg/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-pressed:bg-fg aria-pressed:text-bg"
      >
        <GridIcon />
      </button>
    </div>
  );
}