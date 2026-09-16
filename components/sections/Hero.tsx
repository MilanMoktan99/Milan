"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Edit this content freely. Later it can come from Firebase.
const CONTENT = {
  eyebrow: "Milan Moktan — UI/UX Designer & Web Developer",
  summary:
    "I design interfaces in Figma and build them with Next.js and React, so the product that ships looks and works the way it was designed.",
  location: "Based in Kathmandu, Nepal",
  availability: "Open to freelance and full-time roles",
  stack: [
    { label: "Design", items: ["Figma", "Canva"] },
    {
      label: "Build",
      items: ["Next.js", "React", "Tailwind CSS", "Firebase", "MongoDB", "SQL"],
    },
  ],
};

type Size = { w: number; h: number } | null;

const HANDLES = [
  "-top-1 -left-1",
  "-top-1 -right-1",
  "-bottom-1 -left-1",
  "-bottom-1 -right-1",
];

function DesignFrame({ size }: { size: Size }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-x-[0.06em] top-[0.12em] bottom-[0.04em]"
    >
      <span className="frame-box absolute inset-0 border border-accent" />

      {HANDLES.map((position) => (
        <span
          key={position}
          className={`frame-handle absolute size-2 border border-accent bg-bg ${position}`}
        />
      ))}

      <span className="frame-meta absolute bottom-full left-0 mb-2 text-[clamp(0.625rem,1vw,0.8125rem)] leading-none font-medium tracking-normal whitespace-nowrap text-accent">
        Frame — UI/UX
      </span>

      <span className="frame-meta absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-sm bg-accent px-1.5 py-1 text-[clamp(0.625rem,0.9vw,0.75rem)] leading-none font-medium tracking-normal whitespace-nowrap text-bg tabular-nums">
        {size ? `${size.w} × ${size.h}` : "0 × 0"}
      </span>
    </span>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<Size>(null);

  // Live dimensions for the Figma-style badge
  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    (_, contextSafe) => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.out" },
      });

      tl.from(".hero-eyebrow", { yPercent: 110, duration: 0.8 })
        .from(
          ".hero-line-inner",
          {
            yPercent: 110,
            rotate: 3,
            transformOrigin: "0% 100%",
            duration: 1.1,
            stagger: 0.12,
          },
          "<0.1",
        )
        .fromTo(
          ".frame-box",
          { clipPath: "inset(0% 100% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.9,
            ease: "power3.inOut",
          },
          "-=0.5",
        )
        .from(
          ".frame-handle",
          { scale: 0, duration: 0.4, stagger: 0.06, ease: "back.out(3)" },
          "-=0.35",
        )
        .from(
          ".frame-meta",
          { autoAlpha: 0, y: 6, duration: 0.5, stagger: 0.08 },
          "-=0.2",
        )
        .from(".code-open", { autoAlpha: 0, xPercent: -80, duration: 0.7 }, "<")
        .from(".code-close", { autoAlpha: 0, xPercent: 80, duration: 0.7 }, "<")
        .from(".code-caret", { autoAlpha: 0, duration: 0.01 })
        .from(
          ".hero-fade",
          {
            autoAlpha: 0,
            y: 24,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
          },
          "-=0.7",
        );

      // Headline lines drift apart as you scroll away
      const scrub = {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      };
      gsap.to(".hero-track-1", {
        xPercent: -8,
        ease: "none",
        scrollTrigger: scrub,
      });
      gsap.to(".hero-track-2", {
        xPercent: 8,
        ease: "none",
        scrollTrigger: scrub,
      });

      const play = contextSafe!(() => tl.play());

      if (document.documentElement.dataset.revealed === "true") {
        play();
      } else {
        window.addEventListener("site:reveal", play, { once: true });
      }

      return () => window.removeEventListener("site:reveal", play);
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="relative flex min-h-svh flex-col overflow-x-clip"
    >
      <div className="site-grid flex-1 content-center pt-28 pb-16 lg:pt-24">
        <div className="col-span-full mb-10 overflow-clip lg:col-span-9 lg:col-start-4">
          <p className="hero-eyebrow text-sm font-medium tracking-wide text-muted uppercase">
            {CONTENT.eyebrow}
          </p>
        </div>

        <h1 className="col-span-full lg:col-span-9 lg:col-start-4">
          <span className="sr-only">
            Milan Moktan, UI/UX Designer and Web Developer
          </span>

          <span
            aria-hidden
            className="block text-[clamp(3rem,13vw,6rem)] leading-[0.9] font-medium tracking-[-0.04em] md:text-[11vw] lg:text-[clamp(5rem,8.6vw,12rem)]"
          >
            {/* Line 1: the designer, inside a Figma frame */}
            <span className="block">
              <span className="hero-track-1 relative inline-block">
                <span className="-my-[0.1em] block overflow-clip py-[0.1em]">
                  <span ref={wordRef} className="hero-line-inner block">
                    Designer
                  </span>
                </span>
                <DesignFrame size={size} />
              </span>
            </span>

            {/* Line 2: the developer, as a JSX tag */}
            <span className="mt-[0.35em] block md:text-right">
              <span className="hero-track-2 inline-block">
                <span className="-my-[0.1em] block overflow-clip px-[0.05em] py-[0.1em]">
                  <span className="hero-line-inner inline-flex items-baseline">
                    <span className="code-open mr-[0.04em] text-[0.6em] font-normal text-muted">
                      &lt;
                    </span>
                    Developer
                    <span className="code-close ml-[0.06em] text-[0.6em] font-normal text-muted">
                      /&gt;
                    </span>
                    <span className="code-caret ml-[0.08em] inline-block self-center">
                      <span className="block h-[0.72em] w-[0.06em] animate-[caret-blink_1.1s_steps(1)_infinite] bg-accent motion-reduce:animate-none" />
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </h1>
      </div>

      <div className="site-grid gap-y-8 pb-32 lg:pb-12">
        <p className="hero-fade col-span-full max-w-[38ch] text-lg leading-snug text-balance text-muted md:col-span-4 lg:col-span-4 lg:col-start-4">
          {CONTENT.summary}
        </p>

        <dl className="hero-fade col-span-full grid grid-cols-[auto_1fr] content-start gap-x-6 gap-y-2 text-sm md:col-span-4 lg:col-span-3 lg:col-start-8">
          {CONTENT.stack.map((group) => (
            <Fragment key={group.label}>
              <dt className="pt-0.5 text-xs tracking-wider text-muted uppercase">
                {group.label}
              </dt>
              <dd>{group.items.join(", ")}</dd>
            </Fragment>
          ))}
        </dl>

        <div className="hero-fade col-span-full text-sm md:col-span-8 lg:col-span-2 lg:col-start-11 lg:text-right">
          <p>{CONTENT.location}</p>
          <p className="mt-1 text-muted">
            <span
              aria-hidden
              className="mr-2 inline-block size-2 -translate-y-px rounded-full bg-accent align-middle"
            />
            {CONTENT.availability}
          </p>
        </div>
      </div>
    </section>
  );
}
