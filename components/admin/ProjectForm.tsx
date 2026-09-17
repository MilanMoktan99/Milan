"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProject } from "@/app/admin/actions";
import { FileDrop } from "./FileDrop";
import { btnPrimary, btnSecondary, hintClass, inputClass, labelClass } from "./styles";
import type { ProjectInput } from "@/types";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

type Props = { mode: "create" | "edit"; initial: ProjectInput };

export function ProjectForm({ mode, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectInput>(initial);
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const slugValid = SLUG_RE.test(values.slug);
  const trackUpload = (busy: boolean) => setUploads((n) => n + (busy ? 1 : -1));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveProject(values, mode);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-12">
      {/* Basics */}
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Basics</legend>

        <div>
          <label htmlFor="name" className={labelClass}>
            Project name
          </label>
          <input
            id="name"
            required
            value={values.name}
            onChange={(e) => {
              const name = e.target.value;
              setValues((prev) => ({
                ...prev,
                name,
                slug: slugEdited ? prev.slug : slugify(name),
              }));
            }}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            required
            readOnly={mode === "edit"}
            value={values.slug}
            onChange={(e) => {
              setSlugEdited(true);
              set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
            }}
            aria-describedby="slug-hint"
            className={inputClass}
          />
          <p id="slug-hint" className={hintClass}>
            {mode === "edit"
              ? "The slug can't be changed, since links to this project would break."
              : `Your project's address: /work/${values.slug || "your-slug"}. It can't be changed later.`}
          </p>
          {values.slug && !slugValid && (
            <p className="mt-1.5 text-xs text-accent">
              Use only lowercase letters, numbers, and single hyphens.
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className={labelClass}>
              Type
            </label>
            <select
              id="type"
              value={values.type}
              onChange={(e) => set("type", e.target.value as ProjectInput["type"])}
              className={inputClass}
            >
              <option value="design">UI/UX Design (Case study button)</option>
              <option value="development">Web Development (View project button)</option>
            </select>
          </div>

          <div>
            <label htmlFor="timeline" className={labelClass}>
              Timeline
            </label>
            <input
              id="timeline"
              placeholder="Jan — Mar 2026"
              value={values.timeline}
              onChange={(e) => set("timeline", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="summary" className={labelClass}>
            Summary
          </label>
          <textarea
            id="summary"
            rows={3}
            maxLength={300}
            value={values.summary}
            onChange={(e) => set("summary", e.target.value)}
            aria-describedby="summary-hint"
            className={inputClass}
          />
          <p id="summary-hint" className={hintClass}>
            One sentence. Used for Google results and link previews.
          </p>
        </div>
      </fieldset>

      {/* Files */}
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Files</legend>

        <FileDrop
          kind="cover"
          slug={values.slug}
          label="Cover image"
          hint="JPG, PNG, or WebP, about 2000 × 1250 pixels (16:10)."
          disabled={!slugValid}
          disabledMessage="Add a project name first."
          value={
            values.coverImage
              ? { url: values.coverImage, publicId: values.coverPublicId }
              : null
          }
          onChange={(file) =>
            setValues((prev) => ({
              ...prev,
              coverImage: file?.url ?? "",
              coverPublicId: file?.publicId ?? "",
            }))
          }
          onBusyChange={trackUpload}
        />

        <div>
          <label htmlFor="coverAlt" className={labelClass}>
            Cover description
          </label>
          <input
            id="coverAlt"
            placeholder="Mobile screens of the booking flow"
            value={values.coverAlt}
            onChange={(e) => set("coverAlt", e.target.value)}
            aria-describedby="alt-hint"
            className={inputClass}
          />
          <p id="alt-hint" className={hintClass}>
            Describes the image for screen reader users.
          </p>
        </div>

        <FileDrop
          kind="pdf"
          slug={values.slug}
          label="Case study PDF (optional)"
          hint="Compress the PDF before uploading so it loads quickly."
          disabled={!slugValid}
          disabledMessage="Add a project name first."
          value={
            values.pdfUrl
              ? { url: values.pdfUrl, publicId: values.pdfPublicId ?? "" }
              : null
          }
          onChange={(file) =>
            setValues((prev) => ({
              ...prev,
              pdfUrl: file?.url ?? null,
              pdfPublicId: file?.publicId ?? null,
            }))
          }
          onBusyChange={trackUpload}
        />

        <div>
          <label htmlFor="liveUrl" className={labelClass}>
            Live site link (optional)
          </label>
          <input
            id="liveUrl"
            type="url"
            placeholder="https://"
            value={values.liveUrl ?? ""}
            onChange={(e) => set("liveUrl", e.target.value || null)}
            className={inputClass}
          />
        </div>
      </fieldset>

      {/* Visibility */}
      <fieldset className="space-y-6">
        <legend className="mb-6 text-lg font-medium">Visibility</legend>

        <div className="max-w-40">
          <label htmlFor="order" className={labelClass}>
            Order
          </label>
          <input
            id="order"
            type="number"
            required
            value={Number.isFinite(values.order) ? values.order : ""}
            onChange={(e) => set("order", e.target.valueAsNumber)}
            className={inputClass}
          />
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={values.published}
            onChange={(e) => set("published", e.target.checked)}
            className="mt-1 size-4 accent-current"
          />
          <span>
            <span className="block text-sm font-medium">Published</span>
            <span className="block text-xs text-muted">
              Unchecked projects are drafts and don&apos;t appear on your site.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="mt-1 size-4 accent-current"
          />
          <span>
            <span className="block text-sm font-medium">Featured</span>
            <span className="block text-xs text-muted">
              Shows in the Work section on the home page (up to 5).
            </span>
          </span>
        </label>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-sm border border-accent/40 p-4 text-sm text-accent">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={pending || uploads > 0 || !slugValid}
          className={btnPrimary}
        >
          {pending
            ? "Saving…"
            : uploads > 0
              ? "Waiting for upload…"
              : mode === "create"
                ? "Create project"
                : "Save changes"}
        </button>
        <Link href="/admin" className={btnSecondary}>
          Cancel
        </Link>
      </div>
    </form>
  );
}