import Image from "next/image";
import { BlockReveal } from "./BlockReveal";
import type { CaseStudyBlock } from "@/types";

const COL = "col-span-full lg:col-span-8 lg:col-start-3";
const COL_WIDE = "col-span-full lg:col-span-10 lg:col-start-2";

function Caption({ text }: { text: string }) {
  if (!text) return null;
  return <p className="mt-3 text-sm text-muted">{text}</p>;
}

function Block({ block }: { block: CaseStudyBlock }) {
  switch (block.type) {
    case "overview":
      return (
        <dl
          className={`cs-block ${COL} grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4`}
        >
          {block.items.map((item) => (
            <div key={item.id}>
              <dt className="text-xs tracking-wider text-muted uppercase">
                {item.label}
              </dt>
              <dd className="mt-2 text-lg leading-snug">{item.value}</dd>
            </div>
          ))}
        </dl>
      );

    case "heading":
      return (
        <h2
          className={`cs-block ${COL} text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight font-medium tracking-[-0.02em]`}
        >
          {block.text}
        </h2>
      );

    case "text":
      return (
        <div
          className={`cs-block ${COL} max-w-[68ch] space-y-5 text-lg leading-relaxed text-muted`}
        >
          {block.text.split(/\n{2,}/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      );

    case "list":
      return (
        <div className={`cs-block ${COL} max-w-[68ch]`}>
          {block.title && (
            <h3 className="text-xs tracking-wider text-muted uppercase">
              {block.title}
            </h3>
          )}
          <ul className={`space-y-3 ${block.title ? "mt-4" : ""}`}>
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-4 text-lg leading-relaxed">
                <span
                  aria-hidden
                  className="mt-3 size-1.5 shrink-0 rounded-full bg-accent"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "image":
      return (
        <figure className={`cs-block ${block.wide ? COL_WIDE : COL}`}>
          <div className="relative overflow-clip rounded-sm bg-fg/5">
            <Image
              src={block.image.url}
              alt={block.image.alt}
              width={1600}
              height={1000}
              sizes={
                block.wide
                  ? "(min-width: 1024px) 82vw, 100vw"
                  : "(min-width: 1024px) 66vw, 100vw"
              }
              className="h-auto w-full"
            />
          </div>
          <figcaption>
            <Caption text={block.caption} />
          </figcaption>
        </figure>
      );

    case "gallery":
      return (
        <figure className={`cs-block ${COL_WIDE}`}>
          <div
            className={`grid gap-4 ${
              block.images.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            {block.images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-[3/4] overflow-clip rounded-sm bg-fg/5"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 30vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <figcaption>
            <Caption text={block.caption} />
          </figcaption>
        </figure>
      );

    case "quote":
      return (
        <figure
          className={`cs-block ${COL} border-l-2 border-accent pl-6 lg:pl-8`}
        >
          <blockquote className="max-w-[46ch] text-[clamp(1.25rem,2.2vw,1.75rem)] leading-snug font-medium tracking-[-0.01em]">
            {block.text}
          </blockquote>
          {block.attribution && (
            <figcaption className="mt-4 text-sm text-muted">
              {block.attribution}
            </figcaption>
          )}
        </figure>
      );

    case "stats":
      return (
        <dl className={`cs-block ${COL} grid gap-x-8 gap-y-8 sm:grid-cols-3`}>
          {block.items.map((item) => (
            <div key={item.id}>
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <span className="block text-[clamp(2.25rem,5vw,3.5rem)] leading-none font-medium tracking-[-0.03em] tabular-nums">
                  {item.value}
                </span>
                <span className="mt-3 block max-w-[24ch] text-sm leading-snug text-muted">
                  {item.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      );
  }
}

export function CaseStudyBlocks({ blocks }: { blocks: CaseStudyBlock[] }) {
  return (
    <>
      <BlockReveal />
      <div className="site-grid gap-y-14 lg:gap-y-20">
        {blocks.map((block) => (
          <Block key={block.id} block={block} />
        ))}
      </div>
    </>
  );
}
