"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAbout } from "@/app/admin/actions";
import { FileDrop } from "./FileDrop";
import {
  btnPrimary,
  btnSecondary,
  hintClass,
  inputClass,
  labelClass,
} from "./styles";
import type { AboutContent, Experience } from "@/types";

const newExperience = (): Experience => ({
  id: `exp-${Date.now()}`,
  period: "",
  role: "",
  company: "",
  type: "",
  description: "",
});

export function AboutForm({ initial }: { initial: AboutContent }) {
  const router = useRouter();
  const [values, setValues] = useState<AboutContent>(initial);
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof AboutContent>(
    key: K,
    value: AboutContent[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateExperience = (id: string, patch: Partial<Experience>) =>
    set(
      "experience",
      values.experience.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );

  const moveExperience = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= values.experience.length) return;
    const next = [...values.experience];
    [next[index], next[target]] = [next[target], next[index]];
    set("experience", next);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveAbout(values);
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
      {/* Photo */}
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Photo</legend>

        <FileDrop
          kind="cover"
          slug="about"
          label="Your photo"
          hint="Portrait shape works best, around 1600 × 2000 pixels."
          value={
            values.photoUrl
              ? { url: values.photoUrl, publicId: values.photoPublicId }
              : null
          }
          onChange={(file) =>
            setValues((prev) => ({
              ...prev,
              photoUrl: file?.url ?? "",
              photoPublicId: file?.publicId ?? "",
            }))
          }
          onBusyChange={(busy) => setUploads((n) => n + (busy ? 1 : -1))}
        />

        <div>
          <label htmlFor="photoAlt" className={labelClass}>
            Photo description
          </label>
          <input
            id="photoAlt"
            value={values.photoAlt}
            onChange={(e) => set("photoAlt", e.target.value)}
            aria-describedby="alt-hint"
            className={inputClass}
          />
          <p id="alt-hint" className={hintClass}>
            Describes the photo for screen reader users.
          </p>
        </div>
      </fieldset>

      {/* Bio */}
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Bio</legend>

        <div>
          <label htmlFor="lead" className={labelClass}>
            Opening line
          </label>
          <textarea
            id="lead"
            rows={3}
            required
            value={values.lead}
            onChange={(e) => set("lead", e.target.value)}
            aria-describedby="lead-hint"
            className={inputClass}
          />
          <p id="lead-hint" className={hintClass}>
            The large first sentence. Keep it to two or three lines.
          </p>
        </div>

        <div className="space-y-4">
          <p className={labelClass}>Paragraphs</p>
          {values.paragraphs.map((paragraph, i) => (
            <div key={i}>
              <label htmlFor={`para-${i}`} className="sr-only">
                Paragraph {i + 1}
              </label>
              <textarea
                id={`para-${i}`}
                rows={3}
                value={paragraph}
                onChange={(e) =>
                  set(
                    "paragraphs",
                    values.paragraphs.map((p, index) =>
                      index === i ? e.target.value : p,
                    ),
                  )
                }
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    "paragraphs",
                    values.paragraphs.filter((_, index) => index !== i),
                  )
                }
                className="mt-1.5 text-xs text-muted transition-colors hover:text-fg"
              >
                Remove paragraph
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("paragraphs", [...values.paragraphs, ""])}
            className={btnSecondary}
          >
            Add paragraph
          </button>
        </div>

        <div>
          <label htmlFor="values" className={labelClass}>
            Values
          </label>
          <input
            id="values"
            value={values.values.join(", ")}
            onChange={(e) => set("values", e.target.value.split(","))}
            placeholder="Simplicity, Boldness, Minimalism"
            aria-describedby="values-hint"
            className={inputClass}
          />
          <p id="values-hint" className={hintClass}>
            Separate with commas. Leave empty to hide the values row.
          </p>
        </div>
      </fieldset>

      {/* Experience */}
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Experience</legend>

        {values.experience.length === 0 && (
          <p className="text-sm text-muted">No entries yet.</p>
        )}

        <ol className="space-y-6">
          {values.experience.map((item, i) => (
            <li key={item.id} className="rounded-sm border border-border p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm text-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => moveExperience(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move entry ${i + 1} up`}
                    className="text-muted transition-colors hover:text-fg disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveExperience(i, 1)}
                    disabled={i === values.experience.length - 1}
                    aria-label={`Move entry ${i + 1} down`}
                    className="text-muted transition-colors hover:text-fg disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "experience",
                        values.experience.filter((exp) => exp.id !== item.id),
                      )
                    }
                    className="text-muted transition-colors hover:text-fg"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`role-${item.id}`} className={labelClass}>
                    Role
                  </label>
                  <input
                    id={`role-${item.id}`}
                    value={item.role}
                    onChange={(e) =>
                      updateExperience(item.id, { role: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`company-${item.id}`} className={labelClass}>
                    Company
                  </label>
                  <input
                    id={`company-${item.id}`}
                    value={item.company}
                    onChange={(e) =>
                      updateExperience(item.id, { company: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`period-${item.id}`} className={labelClass}>
                    Period
                  </label>
                  <input
                    id={`period-${item.id}`}
                    placeholder="2025 — Present"
                    value={item.period}
                    onChange={(e) =>
                      updateExperience(item.id, { period: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={`type-${item.id}`} className={labelClass}>
                    Type
                  </label>
                  <input
                    id={`type-${item.id}`}
                    placeholder="Remote, Full-time"
                    value={item.type}
                    onChange={(e) =>
                      updateExperience(item.id, { type: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor={`desc-${item.id}`} className={labelClass}>
                  Description
                </label>
                <textarea
                  id={`desc-${item.id}`}
                  rows={2}
                  value={item.description}
                  onChange={(e) =>
                    updateExperience(item.id, { description: e.target.value })
                  }
                  aria-describedby={`desc-hint-${item.id}`}
                  className={inputClass}
                />
                <p id={`desc-hint-${item.id}`} className={hintClass}>
                  One sentence on what you did and the result.
                </p>
              </div>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() =>
            set("experience", [...values.experience, newExperience()])
          }
          className={btnSecondary}
        >
          Add experience
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
        <button
          type="submit"
          disabled={pending || uploads > 0}
          className={btnPrimary}
        >
          {pending
            ? "Saving…"
            : uploads > 0
              ? "Waiting for upload…"
              : "Save changes"}
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
