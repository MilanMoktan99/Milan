"use client";

import { useEffect, useRef, useState } from "react";
import { pdfjs } from "react-pdf";
import type { PDFPageProxy } from "pdfjs-dist";
import { PdfSkeleton } from "./PdfSkeleton";
import { ArrowUpRightIcon } from "@/components/ui/icons";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type LinkBox = {
  href: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

type PageState = { ratio: number; src: string | null; links: LinkBox[] };

type Props = { url: string; title: string };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function renderPage(page: PDFPageProxy, pixelWidth: number) {
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: pixelWidth / base.width });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) return null;

  await page.render({ canvas, canvasContext: context, viewport }).promise;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.9)
  );
  // Free the canvas memory right away
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) return null;

  const annotations = await page.getAnnotations({ intent: "display" });
  const links: LinkBox[] = annotations
    .filter(
      (a) =>
        a.subtype === "Link" &&
        typeof a.url === "string" &&
        /^https?:\/\//i.test(a.url)
    )
    .map((a) => {
      const [x1, y1] = base.convertToViewportPoint(a.rect[0], a.rect[1]);
      const [x2, y2] = base.convertToViewportPoint(a.rect[2], a.rect[3]);
      return {
        href: a.url as string,
        left: (Math.min(x1, x2) / base.width) * 100,
        top: (Math.min(y1, y2) / base.height) * 100,
        width: (Math.abs(x2 - x1) / base.width) * 100,
        height: (Math.abs(y2 - y1) / base.height) * 100,
      };
    });

  page.cleanup();
  return { src: URL.createObjectURL(blob), links };
}

export default function PdfViewer({ url, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageEls = useRef<(HTMLDivElement | null)[]>([]);
  const nearScreen = useRef(new Set<number>());
  const [pages, setPages] = useState<PageState[]>([]);
  const [failed, setFailed] = useState(false);
  const pageCount = pages.length;

  // Track which pages are on or near the screen
  useEffect(() => {
    if (!pageCount) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (entry.isIntersecting) nearScreen.current.add(index);
          else nearScreen.current.delete(index);
        });
      },
      { rootMargin: "25% 0px" }
    );
    pageEls.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [pageCount]);

  // Load the PDF, then draw pages in the background
  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];
    const task = pdfjs.getDocument({ url });

    let lastScroll = 0;
    const onScroll = () => {
      lastScroll = performance.now();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const run = async () => {
      const pdf = await task.promise;
      const proxies = await Promise.all(
        Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1))
      );
      if (cancelled) return;

      setPages(
        proxies.map((page) => {
          const { width, height } = page.getViewport({ scale: 1 });
          return { ratio: height / width, src: null, links: [] };
        })
      );

      await sleep(50); // let the placeholders mount

      const cssWidth = containerRef.current?.clientWidth || 900;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.min(cssWidth * dpr, 2400);
      const done = new Set<number>();

      const pickNext = () => {
        const visible = [...nearScreen.current]
          .filter((i) => !done.has(i))
          .sort((a, b) => a - b);
        if (visible.length) return { index: visible[0], urgent: true };

        const anchor = Math.max(-1, ...nearScreen.current);
        for (let i = anchor + 1; i < proxies.length; i++) {
          if (!done.has(i)) return { index: i, urgent: false };
        }
        for (let i = 0; i < proxies.length; i++) {
          if (!done.has(i)) return { index: i, urgent: false };
        }
        return null;
      };

      while (!cancelled && done.size < proxies.length) {
        const next = pickNext();
        if (!next) break;

        // Don't draw offscreen pages while the visitor is scrolling
        if (!next.urgent && performance.now() - lastScroll < 250) {
          await sleep(150);
          continue;
        }

        done.add(next.index);

        let result: Awaited<ReturnType<typeof renderPage>> = null;
        try {
          result = await renderPage(proxies[next.index], pixelWidth);
        } catch (error) {
          if (!cancelled) console.error(`[pdf] Page ${next.index + 1} failed:`, error);
        }

        if (cancelled) {
          if (result) URL.revokeObjectURL(result.src);
          return;
        }

        if (result) {
          const rendered = result;
          objectUrls.push(rendered.src);
          setPages((prev) =>
            prev.map((page, i) =>
              i === next.index ? { ...page, ...rendered } : page
            )
          );
        }

        await sleep(next.urgent ? 0 : 60);
      }
    };

    run().catch((error) => {
      if (!cancelled) {
        console.error("[pdf] Failed to load:", error);
        setFailed(true);
      }
    });

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      task.destroy();
      objectUrls.forEach((src) => URL.revokeObjectURL(src));
    };
  }, [url]);

  if (failed) {
    return (
      <div className="rounded-sm border border-border p-8">
        <p>The {title} case study couldn’t load here.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 font-medium underline underline-offset-4"
        >
          Open the PDF in a new tab
          <ArrowUpRightIcon />
        </a>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      {pageCount === 0 ? (
        <PdfSkeleton />
      ) : (
        <div className="space-y-3">
          {pages.map((page, i) => (
            <div
              key={i}
              ref={(el) => {
                pageEls.current[i] = el;
              }}
              data-index={i}
              style={{ aspectRatio: `1 / ${page.ratio}` }}
              className="relative overflow-hidden rounded-sm bg-white ring-1 ring-border"
            >
              {page.src ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.src}
                    alt={`${title} case study, page ${i + 1} of ${pageCount}`}
                    decoding="async"
                    draggable={false}
                    className="absolute inset-0 size-full"
                  />
                  {page.links.map((link, j) => (
                    <a
                      key={j}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Link on page ${i + 1}: ${link.href}`}
                      style={{
                        left: `${link.left}%`,
                        top: `${link.top}%`,
                        width: `${link.width}%`,
                        height: `${link.height}%`,
                      }}
                      className="absolute rounded-sm transition-colors hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-accent"
                    />
                  ))}
                </>
              ) : (
                <div className="absolute inset-0 bg-black/5 motion-safe:animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}