"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCaseStudy } from "@/app/admin/actions";
import { FileDrop } from "./FileDrop";
import {
  btnPrimary,
  btnSecondary,
  hintClass,
  inputClass,
  labelClass,
} from "./styles";
import type { BlockType, CaseStudyBlock } from "@/types";

const uid = () => `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const BLOCK_LABELS: Record<BlockType, string> = {
  overview: "Overview",
  heading: "Heading",
  text: "Text",
  list: "List",
  image: "Image",
  gallery: "Gallery",
  quote: "Quote",
  stats: "Stats",
};

function makeBlock(type: BlockType): CaseStudyBlock {
  const id = uid();
  switch (type) {
    case "overview":
      return {
        id,
        type,
        items: [
          { id: uid(), label: "Role", value: "" },
          { id: uid(), label: "Duration", value: "" },
          { id: uid(), label: "Team", value: "" },
          { id: uid(), label: "Tools", value: "" },
        ],
      };
    case "heading":
      return { id, type, text: "" };
    case "text":
      return { id, type, text: "" };
    case "list":
      return { id, type, title: "", items: [""] };
    case "image":
      return {
        id,
        type,
        image: { id: uid(), url: "", publicId: "", alt: "" },
        caption: "",
        wide: false,
      };
    case "gallery":
      return { id, type, images: [], caption: "" };
    case "quote":
      return { id, type, text: "", attribution: "" };
    case "stats":
      return { id, type, items: [{ id: uid(), value: "", label: "" }] };
  }
}

type Props = { slug: string; projectName: string; initial: CaseStudyBlock[] };

export function BlockEditor({ slug, projectName, initial }: Props) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<CaseStudyBlock[]>(initial);
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const update = (id: string, patch: Partial<CaseStudyBlock>) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? ({ ...block, ...patch } as CaseStudyBlock) : block,
      ),
    );
    setSaved(false);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
    setSaved(false);
  };

  const remove = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
    setSaved(false);
  };

  const add = (type: BlockType) => {
    setBlocks((prev) => [...prev, makeBlock(type)]);
    setSaved(false);
  };

  const trackUpload = (busy: boolean) => setUploads((n) => n + (busy ? 1 : -1));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveCaseStudy(slug, blocks);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  const renderFields = (block: CaseStudyBlock) => {
    switch (block.type) {
      case "overview":
        return (
          <div className="space-y-3">
            {block.items.map((item, i) => (
              <div
                key={item.id}
                className="grid gap-3 sm:grid-cols-[10rem_1fr_auto]"
              >
                <input
                  aria-label={`Row ${i + 1} label`}
                  placeholder="Role"
                  value={item.label}
                  onChange={(e) =>
                    update(block.id, {
                      items: block.items.map((row) =>
                        row.id === item.id
                          ? { ...row, label: e.target.value }
                          : row,
                      ),
                    })
                  }
                  className={inputClass}
                />
                <input
                  aria-label={`Row ${i + 1} value`}
                  placeholder="UI/UX Designer"
                  value={item.value}
                  onChange={(e) =>
                    update(block.id, {
                      items: block.items.map((row) =>
                        row.id === item.id
                          ? { ...row, value: e.target.value }
                          : row,
                      ),
                    })
                  }
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    update(block.id, {
                      items: block.items.filter((row) => row.id !== item.id),
                    })
                  }
                  className="self-end pb-3 text-sm text-muted hover:text-fg"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update(block.id, {
                  items: [...block.items, { id: uid(), label: "", value: "" }],
                })
              }
              className={btnSecondary}
            >
              Add row
            </button>
          </div>
        );

      case "heading":
        return (
          <input
            aria-label="Heading text"
            placeholder="The problem"
            value={block.text}
            onChange={(e) => update(block.id, { text: e.target.value })}
            className={inputClass}
          />
        );

      case "text":
        return (
          <div>
            <textarea
              aria-label="Text"
              rows={6}
              value={block.text}
              onChange={(e) => update(block.id, { text: e.target.value })}
              className={inputClass}
            />
            <p className={hintClass}>Leave a blank line between paragraphs.</p>
          </div>
        );

      case "list":
        return (
          <div className="space-y-3">
            <input
              aria-label="List title"
              placeholder="Goals (optional)"
              value={block.title}
              onChange={(e) => update(block.id, { title: e.target.value })}
              className={inputClass}
            />
            {block.items.map((item, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  aria-label={`Item ${i + 1}`}
                  value={item}
                  onChange={(e) =>
                    update(block.id, {
                      items: block.items.map((row, index) =>
                        index === i ? e.target.value : row,
                      ),
                    })
                  }
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    update(block.id, {
                      items: block.items.filter((_, index) => index !== i),
                    })
                  }
                  className="self-end pb-3 text-sm text-muted hover:text-fg"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update(block.id, { items: [...block.items, ""] })}
              className={btnSecondary}
            >
              Add item
            </button>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <FileDrop
              kind="cover"
              slug={slug}
              label="Image"
              value={
                block.image.url
                  ? { url: block.image.url, publicId: block.image.publicId }
                  : null
              }
              onChange={(file) =>
                update(block.id, {
                  image: {
                    ...block.image,
                    url: file?.url ?? "",
                    publicId: file?.publicId ?? "",
                  },
                })
              }
              onBusyChange={trackUpload}
            />
            <input
              aria-label="Image description"
              placeholder="Image description for screen readers"
              value={block.image.alt}
              onChange={(e) =>
                update(block.id, {
                  image: { ...block.image, alt: e.target.value },
                })
              }
              className={inputClass}
            />
            <input
              aria-label="Caption"
              placeholder="Caption (optional)"
              value={block.caption}
              onChange={(e) => update(block.id, { caption: e.target.value })}
              className={inputClass}
            />
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={block.wide}
                onChange={(e) => update(block.id, { wide: e.target.checked })}
                className="size-4 accent-current"
              />
              Full width
            </label>
          </div>
        );

      case "gallery":
        return (
          <div className="space-y-4">
            {block.images.map((image, i) => (
              <div
                key={image.id}
                className="rounded-sm border border-border p-4"
              >
                <FileDrop
                  kind="cover"
                  slug={slug}
                  label={`Image ${i + 1}`}
                  value={
                    image.url
                      ? { url: image.url, publicId: image.publicId }
                      : null
                  }
                  onChange={(file) =>
                    update(block.id, {
                      images: block.images.map((item) =>
                        item.id === image.id
                          ? {
                              ...item,
                              url: file?.url ?? "",
                              publicId: file?.publicId ?? "",
                            }
                          : item,
                      ),
                    })
                  }
                  onBusyChange={trackUpload}
                />
                <input
                  aria-label={`Image ${i + 1} description`}
                  placeholder="Image description"
                  value={image.alt}
                  onChange={(e) =>
                    update(block.id, {
                      images: block.images.map((item) =>
                        item.id === image.id
                          ? { ...item, alt: e.target.value }
                          : item,
                      ),
                    })
                  }
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    update(block.id, {
                      images: block.images.filter(
                        (item) => item.id !== image.id,
                      ),
                    })
                  }
                  className="mt-2 text-sm text-muted hover:text-fg"
                >
                  Remove image
                </button>
              </div>
            ))}
            {block.images.length < 4 && (
              <button
                type="button"
                onClick={() =>
                  update(block.id, {
                    images: [
                      ...block.images,
                      { id: uid(), url: "", publicId: "", alt: "" },
                    ],
                  })
                }
                className={btnSecondary}
              >
                Add image
              </button>
            )}
            <input
              aria-label="Caption"
              placeholder="Caption (optional)"
              value={block.caption}
              onChange={(e) => update(block.id, { caption: e.target.value })}
              className={inputClass}
            />
          </div>
        );

      case "quote":
        return (
          <div className="space-y-3">
            <textarea
              aria-label="Quote"
              rows={3}
              value={block.text}
              onChange={(e) => update(block.id, { text: e.target.value })}
              className={inputClass}
            />
            <input
              aria-label="Attribution"
              placeholder="Participant 3, usability test"
              value={block.attribution}
              onChange={(e) =>
                update(block.id, { attribution: e.target.value })
              }
              className={inputClass}
            />
          </div>
        );

      case "stats":
        return (
          <div className="space-y-3">
            {block.items.map((item, i) => (
              <div
                key={item.id}
                className="grid gap-3 sm:grid-cols-[8rem_1fr_auto]"
              >
                <input
                  aria-label={`Stat ${i + 1} value`}
                  placeholder="40%"
                  value={item.value}
                  onChange={(e) =>
                    update(block.id, {
                      items: block.items.map((row) =>
                        row.id === item.id
                          ? { ...row, value: e.target.value }
                          : row,
                      ),
                    })
                  }
                  className={inputClass}
                />
                <input
                  aria-label={`Stat ${i + 1} label`}
                  placeholder="faster checkout in testing"
                  value={item.label}
                  onChange={(e) =>
                    update(block.id, {
                      items: block.items.map((row) =>
                        row.id === item.id
                          ? { ...row, label: e.target.value }
                          : row,
                      ),
                    })
                  }
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    update(block.id, {
                      items: block.items.filter((row) => row.id !== item.id),
                    })
                  }
                  className="self-end pb-3 text-sm text-muted hover:text-fg"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update(block.id, {
                  items: [...block.items, { id: uid(), value: "", label: "" }],
                })
              }
              className={btnSecondary}
            >
              Add stat
            </button>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10">
      {blocks.length === 0 && (
        <p className="text-muted">No sections yet. Add your first one below.</p>
      )}

      <ol className="space-y-6">
        {blocks.map((block, i) => (
          <li key={block.id} className="rounded-sm border border-border p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm font-medium">
                <span className="text-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>{" "}
                {BLOCK_LABELS[block.type]}
              </p>
              <div className="flex items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move section ${i + 1} up`}
                  className="text-muted hover:text-fg disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === blocks.length - 1}
                  aria-label={`Move section ${i + 1} down`}
                  className="text-muted hover:text-fg disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(block.id)}
                  className="text-muted hover:text-fg"
                >
                  Delete
                </button>
              </div>
            </div>

            {renderFields(block)}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-sm border border-dashed border-border p-5">
        <p className={labelClass}>Add a section</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => add(type)}
              className={btnSecondary}
            >
              {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-accent/40 p-4 text-sm text-accent"
        >
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={pending || uploads > 0}
          className={btnPrimary}
        >
          {pending
            ? "Saving…"
            : uploads > 0
              ? "Waiting for upload…"
              : "Save case study"}
        </button>
        <Link href={`/work/${slug}`} target="_blank" className={btnSecondary}>
          Preview page
        </Link>
        <Link href="/admin" className={btnSecondary}>
          Back to projects
        </Link>
        <span aria-live="polite" className="text-sm text-muted">
          {saved && !pending ? `Saved ${projectName}.` : ""}
        </span>
      </div>
    </form>
  );
}
