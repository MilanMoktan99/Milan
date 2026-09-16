"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { SERVICES } from "@/lib/content/services";
import { session } from "@/lib/session";
import { ArrowUpRightIcon } from "@/components/ui/icons";

const ease = "ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none";

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".svc-heading-inner", {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: ".svc-heading", start: "top 85%" },
      });

      gsap.from(".svc-intro", {
        y: 24,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".svc-intro", start: "top 88%" },
      });

      gsap.utils.toArray<HTMLElement>(".svc-row").forEach((row) => {
        gsap
          .timeline({ scrollTrigger: { trigger: row, start: "top 90%" } })
          .fromTo(
            row.querySelectorAll(".svc-line"),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.2, ease: "power3.inOut" },
          )
          .from(
            row.querySelectorAll(".svc-meta"),
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
    { scope: sectionRef },
  );

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    title: string,
  ) => {
    session.selectedService = title;
    window.dispatchEvent(new CustomEvent("site:service", { detail: title }));
    if (!lenis) return;
    e.preventDefault();
    lenis.scrollTo("#contact");
    history.replaceState(null, "", "#contact");
  };

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-title"
      className="py-16 md:py-20 lg:py-24"
    >
      <div className="site-grid gap-y-6 mb-10 lg:mb-14">
        <div className="svc-heading col-span-full lg:col-span-5 lg:col-start-4">
          <h2
            id="services-title"
            className="-my-[0.1em] overflow-clip py-[0.1em] text-[clamp(2.5rem,6vw,5.5rem)] leading-none font-medium tracking-[-0.03em]"
          >
            <span className="svc-heading-inner block">What I Provide</span>
          </h2>
        </div>
      </div>

      <div className="site-grid">
        <ol className="col-span-full lg:col-span-9 lg:col-start-4">
          {SERVICES.map((service, i) => (
            <li
              key={service.title}
              className="svc-row group relative transition-opacity duration-500 lg:group-hover/list:opacity-35 lg:hover:opacity-100! lg:has-[:focus-visible]:opacity-100!"
            >
              {/* Base line + highlight line that draws on hover */}
              <span
                aria-hidden
                className="svc-line absolute inset-x-0 top-0 h-px origin-left bg-border"
              />
              <span
                aria-hidden
                className={`absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-fg transition-transform duration-700 group-hover:scale-x-100 group-has-[:focus-visible]:scale-x-100 ${ease}`}
              />
              {i === SERVICES.length - 1 && (
                <span
                  aria-hidden
                  className="svc-line absolute inset-x-0 bottom-0 h-px origin-left bg-border"
                />
              )}

              <a
                href="#contact"
                onClick={(e) => handleClick(e, service.title)}
                className="relative grid gap-x-10 gap-y-6 rounded-sm py-8 pr-16 outline-none lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_auto] lg:items-center lg:py-10 lg:pr-0"
              >
                <div className="svc-meta">
                  <h3 className="flex flex-wrap items-baseline gap-x-3 text-[clamp(1.625rem,3vw,2.75rem)] leading-tight font-medium tracking-[-0.02em]">
                    <span className="tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden className="text-muted">
                      —
                    </span>
                    <span
                      className={`transition-transform duration-500 lg:group-hover:translate-x-2 ${ease}`}
                    >
                      {service.title}
                    </span>
                  </h3>
                  <p className="mt-3 max-w-[48ch] leading-relaxed text-muted">
                    {service.description}
                  </p>
                </div>

                <ul className="svc-meta grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted transition-colors duration-500 group-hover:text-fg">
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <span
                  aria-hidden
                  className="svc-meta absolute top-8 right-0 grid size-12 place-items-center rounded-full border border-fg/25 transition-colors duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-bg group-has-[:focus-visible]:border-fg group-has-[:focus-visible]:bg-fg group-has-[:focus-visible]:text-bg lg:static"
                >
                  <ArrowUpRightIcon
                    className={`size-5 transition-transform duration-500 group-hover:rotate-45 ${ease}`}
                  />
                </span>

                <span className="sr-only">Start a {service.title} project</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
