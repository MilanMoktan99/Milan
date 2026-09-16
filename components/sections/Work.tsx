"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { PROJECT_ACTION_LABEL, PROJECT_TYPE_LABEL } from "@/lib/project-labels";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Project } from "@/types";

const PREVIEW_QUERY =
  "(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const canPreview = () => window.matchMedia(PREVIEW_QUERY).matches;

export function Work({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const moveX = useRef<gsap.QuickToFunc | null>(null);
  const moveY = useRef<gsap.QuickToFunc | null>(null);
  const activeIndex = useRef(-1);
  const layer = useRef(1);
  const [armed, setArmed] = useState(false);

  const { contextSafe } = useGSAP(
    () => {
      const preview = previewRef.current;
      if (preview) {
        gsap.set(preview, { scale: 0.9 });
        moveX.current = gsap.quickTo(preview, "x", {
          duration: 0.6,
          ease: "power3",
        });
        moveY.current = gsap.quickTo(preview, "y", {
          duration: 0.6,
          ease: "power3",
        });
      }

      // Load the large preview images only when the section gets close
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom+=50%",
        once: true,
        onEnter: () => canPreview() && setArmed(true),
      });

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".work-heading-inner", {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: ".work-heading", start: "top 85%" },
      });

      gsap.utils.toArray<HTMLElement>(".work-row").forEach((row) => {
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 90%" } })
          .fromTo(
            row.querySelectorAll(".work-line"),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, ease: "power3.inOut" },
          )
          .from(
            row.querySelectorAll(".work-meta"),
            {
              y: 24,
              autoAlpha: 0,
              duration: 0.8,
              stagger: 0.07,
              ease: "power3.out",
            },
            0.2,
          );
      });
    },
    { scope: sectionRef, dependencies: [projects.length] },
  );

  const getPosition = (clientX: number, clientY: number) => {
    const { offsetWidth: w, offsetHeight: h } = previewRef.current!;
    const gap = 32;
    const fitsRight = clientX + gap + w <= window.innerWidth - 24;

    return {
      x: fitsRight ? clientX + gap : Math.max(24, clientX - gap - w),
      y: Math.min(Math.max(clientY - h / 2, 24), window.innerHeight - h - 24),
    };
  };

  const handleMove = contextSafe((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !previewRef.current || !canPreview())
      return;
    const { x, y } = getPosition(e.clientX, e.clientY);
    moveX.current?.(x);
    moveY.current?.(y);
  });

  const showPreview = contextSafe((index: number, e: React.PointerEvent) => {
    const preview = previewRef.current;
    if (e.pointerType !== "mouse" || !preview || !canPreview()) return;
    if (activeIndex.current === index) return;

    setArmed(true);

    if (activeIndex.current === -1) {
      // First hover: jump to the cursor instead of flying in from the corner
      gsap.set(preview, getPosition(e.clientX, e.clientY));
    }
    activeIndex.current = index;

    const item = preview.querySelectorAll<HTMLElement>(".preview-item")[index];
    if (!item) return;

    gsap.killTweensOf(item);
    gsap.set(item, { zIndex: ++layer.current });
    gsap.fromTo(
      item,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power4.out" },
    );

    const img = item.querySelector("img");
    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.3 },
        { scale: 1, duration: 0.9, ease: "power4.out" },
      );
    }

    gsap.to(preview, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
  });

  const hidePreview = contextSafe((immediate?: unknown) => {
    if (activeIndex.current === -1) return;
    activeIndex.current = -1;

    if (immediate === true) {
      gsap.killTweensOf(previewRef.current, "opacity,visibility,scale");
      gsap.set(previewRef.current, { autoAlpha: 0, scale: 0.9 });
      return;
    }

    gsap.to(previewRef.current, {
      autoAlpha: 0,
      scale: 0.9,
      duration: 0.4,
      ease: "power3.out",
      overwrite: "auto",
    });
  });

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-labelledby="work-title"
      className="py-32 lg:py-40"
    >
      <div className="site-grid mb-10 lg:mb-14">
        <div className="work-heading col-span-full flex items-end justify-between gap-6 lg:col-span-9 lg:col-start-4">
          <h2
            id="work-title"
            className="-my-[0.1em] overflow-clip py-[0.1em] text-[clamp(2.5rem,6vw,5.5rem)] leading-none font-medium tracking-[-0.03em]"
          >
            <span className="work-heading-inner block">Selected work</span>
          </h2>
          {projects.length > 0 && (
            <p className="pb-2 text-sm text-muted tabular-nums">
              ({String(projects.length).padStart(2, "0")})
            </p>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="site-grid">
          <p className="col-span-full text-muted lg:col-span-6 lg:col-start-4">
            New case studies are on the way. Check back soon.
          </p>
        </div>
      ) : (
        <ol
          className="group/list site-grid"
          onPointerMove={handleMove}
          onPointerLeave={hidePreview}
        >
          {projects.map((project, i) => (
            <li
              key={project.slug}
              className="work-row relative col-span-full transition-opacity duration-500 lg:col-span-9 lg:col-start-4 lg:group-hover/list:opacity-40 lg:hover:opacity-100!"
            >
              <span
                aria-hidden
                className="work-line absolute inset-x-0 top-0 h-px origin-left bg-border"
              />
              {i === projects.length - 1 && (
                <span
                  aria-hidden
                  className="work-line absolute inset-x-0 bottom-0 h-px origin-left bg-border"
                />
              )}

              <Link
                href={`/work/${project.slug}`}
                onPointerEnter={(e) => showPreview(i, e)}
                onClick={() => hidePreview(true)}
                className="group grid grid-cols-[7rem_1fr] items-center gap-x-5 gap-y-3 rounded-sm py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:grid-cols-[9rem_1fr_auto] lg:grid-cols-[11rem_1fr_auto] lg:gap-x-8 lg:py-7"
              >
                <div className="work-meta relative row-span-2 aspect-[16/10] self-start overflow-clip rounded-sm bg-fg/5 sm:row-span-1 sm:self-center">
                  <Image
                    src={project.coverImage}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 11rem, (min-width: 640px) 9rem, 7rem"
                    className="object-cover transition-[scale] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>

                <div className="work-meta min-w-0">
                  <h3 className="text-xl leading-tight font-medium tracking-[-0.01em] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] sm:text-2xl lg:text-[clamp(1.5rem,2.2vw,2.25rem)] lg:group-hover:translate-x-2 motion-reduce:transition-none">
                    {project.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted">
                    {PROJECT_TYPE_LABEL[project.type]}
                    {project.timeline && (
                      <>
                        <span aria-hidden> · </span>
                        {project.timeline}
                      </>
                    )}
                  </p>
                </div>

                <span className="work-meta col-start-2 inline-flex items-center gap-2 justify-self-start rounded-full border border-fg/25 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-bg sm:col-start-auto sm:justify-self-end">
                  {PROJECT_ACTION_LABEL[project.type]}
                  <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {/* Floating cover preview (desktop mouse only) */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-20 hidden aspect-[16/10] w-[clamp(18rem,26vw,28rem)] overflow-clip rounded-sm opacity-0 shadow-2xl lg:block"
      >
        {projects.map((project) => (
          <div
            key={project.slug}
            className="preview-item absolute inset-0 overflow-clip bg-fg/5"
            style={{ clipPath: "inset(100% 0% 0% 0%)" }}
          >
            {armed && (
              <Image
                src={project.coverImage}
                alt=""
                fill
                sizes="28rem"
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
