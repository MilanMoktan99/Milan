"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export function Loader() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  // Lock scrolling while the intro plays
  useEffect(() => {
    if (!lenis) return;
    if (done) lenis.start();
    else lenis.stop();
  }, [lenis, done]);

  useGSAP(
    (_, contextSafe) => {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);

      let cancelled = false;
      let split: SplitText | undefined;

      const finish = () => {
        document.documentElement.dataset.loaded = "true";
        window.dispatchEvent(new Event("site:loaded"));
        setDone(true);
      };

      const reveal = () => {
        document.documentElement.dataset.revealed = "true";
        window.dispatchEvent(new Event("site:reveal"));
      };

      const play = contextSafe!(() => {
        if (cancelled) return;
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduce) {
          gsap
            .timeline({ onComplete: finish })
            .set(".loader-content", { autoAlpha: 1 })
            .call(reveal, [], 0.8)
            .to(rootRef.current, { autoAlpha: 0, duration: 0.4, delay: 0.8 });
          return;
        }

        split = SplitText.create(".loader-name", {
          type: "chars",
          mask: "chars",
        });

        gsap
          .timeline({ defaults: { ease: "power4.out" }, onComplete: finish })
          .set(".loader-content", { autoAlpha: 1 })
          .from(split.chars, { yPercent: 110, duration: 0.9, stagger: 0.035 })
          .fromTo(
            ".loader-tagline",
            { clipPath: "inset(-30% 100% -30% -5%)" },
            {
              clipPath: "inset(-30% -5% -30% -5%)",
              duration: 1.2,
              ease: "power2.inOut",
            },
            "-=0.45",
          )
          .to(
            ".loader-content",
            { yPercent: -20, autoAlpha: 0, duration: 0.6, ease: "power3.in" },
            "+=0.5",
          )
          .to(
            rootRef.current,
            { yPercent: -100, duration: 0.9, ease: "power4.inOut" },
            "-=0.25",
          )
          .call(reveal, [], "<0.2");
      });

      document.fonts.ready.then(play);

      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    { scope: rootRef },
  );

  if (done) return null;

  return (
    <div
      ref={rootRef}
      id="site-loader"
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center bg-bg px-(--grid-margin) text-fg"
    >
      <div className="loader-content invisible">
        <p className="loader-name text-[clamp(3rem,8vw,6rem)] leading-[0.95] font-normal tracking-tight">
          Milan Moktan
        </p>
        <p className="mt-1 pl-[0.6em] text-[clamp(2.25rem,5.5vw,5rem)] leading-tight text-muted">
          <span className="loader-tagline inline-block font-script">
            -Designer and Developer
          </span>
        </p>
      </div>
    </div>
  );
}
