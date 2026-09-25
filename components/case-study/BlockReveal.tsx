"use client";

import { useGSAP, gsap } from "@/lib/gsap";

export function BlockReveal() {
  useGSAP(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.utils.toArray<HTMLElement>(".cs-block").forEach((el) => {
      gsap.from(el, {
        y: 28,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power3.out",
        clearProps: "opacity,visibility,transform",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
  });

  return null;
}
