"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveHero } from "@/app/admin/actions";
import {
  btnPrimary,
  btnSecondary,
  hintClass,
  inputClass,
  labelClass,
} from "./styles";
import type { HeroContent } from "@/types";

export function HeroForm({ initial }: { initial: HeroContent }) {
  const router = useRouter();
  const [values, setValues] = useState<HeroContent>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof HeroContent>(key: K, value: HeroContent[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateGroup = (
    index: number,
    patch: Partial<HeroContent["stack"][number]>,
  ) =>
    set(
      "stack",
      values.stack.map((group, i) =>
        i === index ? { ...group, ...patch } : group,
      ),
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveHero(values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-12">
      {/* Headline */}
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Headline</legend>

        <div>
          <label htmlFor="eyebrow" className={labelClass}>
            Eyebrow line
          </label>
          <input
            id="eyebrow"
            value={values.eyebrow}
            onChange={(e) => set("eyebrow", e.target.value)}
            aria-describedby="eyebrow-hint"
            className={inputClass}
          />
          <p id="eyebrow-hint" className={hintClass}>
            The small uppercase line above the headline.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="designWord" className={labelClass}>
              First word (in the frame)
            </label>
            <input
              id="designWord"
              required
              value={values.designWord}
              onChange={(e) => set("designWord", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="devWord" className={labelClass}>
              Second word (in the tag)
            </label>
            <input
              id="devWord"
              required
              value={values.devWord}
              onChange={(e) => set("devWord", e.target.value)}
              aria-describedby="dev-hint"
              className={inputClass}
            />
            <p id="dev-hint" className={hintClass}>
              Shown as &lt;Word/&gt; with a blinking cursor.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="frameLabel" className={labelClass}>
            Frame label
          </label>
          <input
            id="frameLabel"
            value={values.frameLabel}
            onChange={(e) => set("frameLabel", e.target.value)}
            aria-describedby="frame-hint"
            className={inputClass}
          />
          <p id="frame-hint" className={hintClass}>
            The small accent label above the frame. Leave empty to hide it.
          </p>
        </div>

        <div>
          <label htmlFor="headingAlt" className={labelClass}>
            Headline for screen readers
          </label>
          <input
            id="headingAlt"
            required
            value={values.headingAlt}
            onChange={(e) => set("headingAlt", e.target.value)}
            aria-describedby="alt-hint"
            className={inputClass}
          />
          <p id="alt-hint" className={hintClass}>
            A plain sentence, since the styled headline reads oddly aloud.
          </p>
        </div>
      </fieldset>

      {/* Details */}
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Details</legend>

        <div>
          <label htmlFor="summary" className={labelClass}>
            Summary
          </label>
          <textarea
            id="summary"
            rows={3}
            value={values.summary}
            onChange={(e) => set("summary", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className={labelClass}>
              Location
            </label>
            <input
              id="location"
              value={values.location}
              onChange={(e) => set("location", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="availability" className={labelClass}>
              Availability
            </label>
            <input
              id="availability"
              value={values.availability}
              onChange={(e) => set("availability", e.target.value)}
              aria-describedby="avail-hint"
              className={inputClass}
            />
            <p id="avail-hint" className={hintClass}>
              Keep this accurate. People take it literally.
            </p>
          </div>
        </div>
      </fieldset>

      {/* Tools */}
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Tools</legend>

        {values.stack.map((group, i) => (
          <div key={i} className="rounded-sm border border-border p-5">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <div>
                <label htmlFor={`group-label-${i}`} className={labelClass}>
                  Group name
                </label>
                <input
                  id={`group-label-${i}`}
                  value={group.label}
                  onChange={(e) => updateGroup(i, { label: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`group-items-${i}`} className={labelClass}>
                  Tools
                </label>
                <input
                  id={`group-items-${i}`}
                  value={group.items.join(", ")}
                  onChange={(e) =>
                    updateGroup(i, { items: e.target.value.split(",") })
                  }
                  placeholder="Figma, Canva"
                  aria-describedby={`group-hint-${i}`}
                  className={inputClass}
                />
                <p id={`group-hint-${i}`} className={hintClass}>
                  Separate with commas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                set(
                  "stack",
                  values.stack.filter((_, index) => index !== i),
                )
              }
              className="mt-3 text-sm text-muted transition-colors hover:text-fg"
            >
              Remove group
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            set("stack", [...values.stack, { label: "", items: [] }])
          }
          className={btnSecondary}
        >
          Add group
        </button>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="rounded-sm border border-accent/40 p-4 text-sm text-accent"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link href="/admin" className={btnSecondary}>
          Back to projects
        </Link>
        <span aria-live="polite" className="text-sm text-muted">
          {saved && !pending ? "Saved." : ""}
        </span>
      </div>
    </form>
  );
}
