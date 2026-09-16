"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { ABOUT, EXPERIENCE } from "@/lib/content/about";

export function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".about-heading-inner", {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: ".about-heading", start: "top 85%" },
      });

      // Photo opens from the bottom, image settles from a zoom
      gsap
        .timeline({ scrollTrigger: { trigger: ".about-photo", start: "top 80%" } })
        .fromTo(
          ".about-photo",
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut" }
        )
        .from(".about-photo-inner", { scale: 1.3, duration: 1.8, ease: "power4.out" }, 0);

      gsap.fromTo(
        ".about-photo-parallax",
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-photo",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );

      // Lead text brightens word by word as you scroll
      const split = SplitText.create(".about-lead", { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.25 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-lead",
            start: "top 80%",
            end: "bottom 50%",
            scrub: true,
          },
        }
      );

      gsap.utils.toArray<HTMLElement>(".about-fade").forEach((el) => {
        gsap.from(el, {
          y: 24,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      gsap.from(".exp-heading-inner", {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: ".exp-heading", start: "top 85%" },
      });

      gsap.utils.toArray<HTMLElement>(".exp-row").forEach((row) => {
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 90%" } })
          .fromTo(
            row.querySelectorAll(".exp-line"),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, ease: "power3.inOut" }
          )
          .from(
            row.querySelectorAll(".exp-meta"),
            { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: "power3.out" },
            0.2
          );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-title"
      className="py-32 lg:py-40"
    >
      <div className="site-grid mb-12 lg:mb-20">
        <div className="about-heading col-span-full lg:col-span-9 lg:col-start-4">
          <h2
            id="about-title"
            className="-my-[0.1em] overflow-clip py-[0.1em] text-[clamp(2.5rem,6vw,5.5rem)] leading-none font-medium tracking-[-0.03em]"
          >
            <span className="about-heading-inner block">About me</span>
          </h2>
        </div>
      </div>

      {/* Photo + bio */}
      <div className="site-grid gap-y-12">
        <div className="col-span-full md:col-span-3 lg:col-span-3 lg:col-start-4">
          <div className="about-photo relative aspect-[4/5] max-w-sm overflow-clip rounded-sm bg-fg/5 md:sticky md:top-24 md:max-w-none">
            <div className="about-photo-parallax absolute inset-x-0 -top-[6%] -bottom-[6%]">
              <div className="about-photo-inner absolute inset-0">
                {ABOUT.photo.src ? (
                  <Image
                    src={ABOUT.photo.src}
                    alt={ABOUT.photo.alt}
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 768px) 36vw, 384px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-sm text-muted">
                    Your photo
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-full md:col-span-5 lg:col-span-5 lg:col-start-8">
          <p className="about-lead text-[clamp(1.5rem,2.5vw,2.375rem)] leading-[1.2] font-medium tracking-[-0.02em]">
            {ABOUT.lead}
          </p>

          <div className="mt-10 max-w-[52ch] space-y-5 text-lg leading-relaxed text-muted">
            {ABOUT.paragraphs.map((paragraph) => (
              <p key={paragraph} className="about-fade">
                {paragraph}
              </p>
            ))}
          </div>

          {ABOUT.values.length > 0 && (
            <div className="about-fade mt-10">
              <h3 className="text-xs tracking-wider text-muted uppercase">
                What I value
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ABOUT.values.map((value) => (
                  <li
                    key={value}
                    className="rounded-full border border-fg/25 px-4 py-1.5 text-sm"
                  >
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Experience */}
      {EXPERIENCE.length > 0 && (
        <div className="site-grid mt-32 lg:mt-48">
          <div className="col-span-full lg:col-span-9 lg:col-start-4">
            <h3 className="exp-heading mb-8 -my-[0.1em] overflow-clip py-[0.1em] text-[clamp(1.75rem,3.5vw,3rem)] leading-none font-medium tracking-[-0.02em] lg:mb-10">
              <span className="exp-heading-inner block">Experience</span>
            </h3>

            <ol>
              {EXPERIENCE.map((item, i) => (
                <li
                  key={`${item.company}-${item.period}`}
                  className="exp-row relative grid gap-x-8 gap-y-2 py-6 md:grid-cols-[11rem_1fr_auto] lg:py-8"
                >
                  <span
                    aria-hidden
                    className="exp-line absolute inset-x-0 top-0 h-px origin-left bg-border"
                  />
                  {i === EXPERIENCE.length - 1 && (
                    <span
                      aria-hidden
                      className="exp-line absolute inset-x-0 bottom-0 h-px origin-left bg-border"
                    />
                  )}

                  <p className="exp-meta text-sm text-muted tabular-nums md:pt-1.5">
                    {item.period}
                  </p>

                  <div className="exp-meta">
                    <h4 className="text-xl leading-tight font-medium tracking-[-0.01em] lg:text-2xl">
                      {item.role}
                    </h4>
                    <p className="mt-1 text-muted">{item.company}</p>
                    {item.description && (
                      <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <p className="exp-meta text-sm text-muted md:pt-1.5 md:text-right">
                    {item.type}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}