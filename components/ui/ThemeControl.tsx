"use client";

import { useEffect, useId, useRef, useState } from "react";
import { THEMES } from "@/lib/theme";
import { useTheme } from "@/lib/preferences";
import { SunIcon } from "./icons";

const LAST = THEMES.length - 1;

export function ThemeControl() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragging = useRef(false);
  const pointerType = useRef("");
  const trackId = useId();

  const index = Math.max(
    0,
    THEMES.findIndex((t) => t.id === theme),
  );
  const current = THEMES[index];

  const selectIndex = (i: number) => {
    setTheme(THEMES[Math.min(LAST, Math.max(0, i))].id);
  };

  const indexFromPointer = (clientY: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return Math.round(((clientY - rect.top) / rect.height) * LAST);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      Home: 0,
      End: LAST,
    };
    if (e.key in map) {
      e.preventDefault();
      selectIndex(map[e.key]);
    }
  };

  // Close on outside tap or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      className="relative flex w-12 flex-col-reverse items-center rounded-full bg-fg/10 backdrop-blur has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={trackId}
        aria-label={`Color theme: ${current.label}`}
        onPointerDown={(e) => (pointerType.current = e.pointerType)}
        onClick={() => {
          // Mouse already opens on hover; touch and keyboard toggle
          if (pointerType.current !== "mouse") setOpen((o) => !o);
          pointerType.current = "";
        }}
        className="grid size-12 place-items-center rounded-full text-fg outline-none"
      >
        <SunIcon />
      </button>

      <div
        id={trackId}
        inert={!open}
        className={`grid w-full transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            role="slider"
            tabIndex={0}
            aria-label="Color theme"
            aria-orientation="vertical"
            aria-valuemin={1}
            aria-valuemax={THEMES.length}
            aria-valuenow={index + 1}
            aria-valuetext={current.label}
            onKeyDown={onKeyDown}
            onPointerDown={(e) => {
              dragging.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              selectIndex(indexFromPointer(e.clientY));
            }}
            onPointerMove={(e) => {
              if (dragging.current) selectIndex(indexFromPointer(e.clientY));
            }}
            onPointerUp={() => (dragging.current = false)}
            className="cursor-grab touch-none px-4 pt-6 pb-2 outline-none active:cursor-grabbing"
          >
            <div ref={trackRef} className="relative h-56">
              {THEMES.map((t, i) => (
                <span
                  key={t.id}
                  aria-hidden
                  style={{ top: `${(i / LAST) * 100}%` }}
                  className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg transition-all duration-300 ${
                    i === index ? "size-2.5" : "size-1 opacity-40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {open && (
        <span
          aria-hidden
          style={{ top: `calc(1.5rem + ${index / LAST} * 14rem)` }}
          className="pointer-events-none absolute left-full ml-3 -translate-y-1/2 whitespace-nowrap rounded-full bg-fg px-3 py-1 text-sm text-bg"
        >
          {current.label}
        </span>
      )}
    </div>
  );
}
