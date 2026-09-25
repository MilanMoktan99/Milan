import type { BlockImage, CaseStudyBlock } from "@/types";

const str = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const arr = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const obj = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

function parseImage(value: unknown, index: number): BlockImage | null {
  const item = obj(value);
  const url = str(item.url).trim();
  if (!url) return null;
  return {
    id: str(item.id) || `img-${index}`,
    url,
    publicId: str(item.publicId),
    alt: str(item.alt),
  };
}

function parseBlock(value: unknown, index: number): CaseStudyBlock | null {
  const raw = obj(value);
  const id = str(raw.id) || `block-${index}`;
  const type = str(raw.type);

  switch (type) {
    case "overview": {
      const items = arr(raw.items)
        .map((entry, i) => {
          const item = obj(entry);
          return {
            id: str(item.id) || `row-${i}`,
            label: str(item.label).trim(),
            value: str(item.value).trim(),
          };
        })
        .filter((item) => item.label || item.value);
      return items.length ? { id, type: "overview", items } : null;
    }

    case "heading": {
      const text = str(raw.text).trim();
      return text ? { id, type: "heading", text } : null;
    }

    case "text": {
      const text = str(raw.text).trim();
      return text ? { id, type: "text", text } : null;
    }

    case "list": {
      const items = arr(raw.items)
        .map((item) => str(item).trim())
        .filter(Boolean);
      return items.length
        ? { id, type: "list", title: str(raw.title).trim(), items }
        : null;
    }

    case "image": {
      const image = parseImage(raw.image, index);
      return image
        ? {
            id,
            type: "image",
            image,
            caption: str(raw.caption).trim(),
            wide: raw.wide === true,
          }
        : null;
    }

    case "gallery": {
      const images = arr(raw.images)
        .map(parseImage)
        .filter((image): image is BlockImage => image !== null);
      return images.length
        ? { id, type: "gallery", images, caption: str(raw.caption).trim() }
        : null;
    }

    case "quote": {
      const text = str(raw.text).trim();
      return text
        ? { id, type: "quote", text, attribution: str(raw.attribution).trim() }
        : null;
    }

    case "stats": {
      const items = arr(raw.items)
        .map((entry, i) => {
          const item = obj(entry);
          return {
            id: str(item.id) || `stat-${i}`,
            value: str(item.value).trim(),
            label: str(item.label).trim(),
          };
        })
        .filter((item) => item.value || item.label);
      return items.length ? { id, type: "stats", items } : null;
    }

    default:
      return null;
  }
}

export function parseBlocks(value: unknown): CaseStudyBlock[] {
  return arr(value)
    .map(parseBlock)
    .filter((block): block is CaseStudyBlock => block !== null);
}

export function collectPublicIds(blocks: CaseStudyBlock[]): string[] {
  const ids: string[] = [];
  blocks.forEach((block) => {
    if (block.type === "image" && block.image.publicId)
      ids.push(block.image.publicId);
    if (block.type === "gallery") {
      block.images.forEach(
        (image) => image.publicId && ids.push(image.publicId),
      );
    }
  });
  return ids;
}
