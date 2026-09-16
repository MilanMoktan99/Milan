"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { session } from "@/lib/session";
import "lenis/dist/lenis.css";

function ScrollManager() {
  const pathname = usePathname();
  const lastHomeY = useRef(0);
  const prevPath = useRef<string | null>(null);

  const lenis = useLenis((instance) => {
    ScrollTrigger.update();
    if (window.location.pathname === "/") lastHomeY.current = instance.scroll;
  });

  useEffect(() => {
    if (!lenis) return;
    const update = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [lenis]);

  // Remember which page the visitor landed on first
  useEffect(() => {
    if (session.entryPath === null) session.entryPath = pathname;
  }, [pathname]);

  // Set the scroll position after moving between pages
  useEffect(() => {
    if (!lenis) return;
    const previous = prevPath.current;
    prevPath.current = pathname;
    if (previous === null || previous === pathname) return;

    if (previous === "/") session.homeScroll = lastHomeY.current;

    requestAnimationFrame(() => {
      lenis.resize();

      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;

      if (target) {
        lenis.scrollTo(target, { immediate: true, force: true });
      } else if (pathname === "/" && session.homeScroll !== null) {
        lenis.scrollTo(session.homeScroll, { immediate: true, force: true });
      } else {
        lenis.scrollTo(0, { immediate: true, force: true });
      }

      if (pathname === "/") session.homeScroll = null;
      ScrollTrigger.refresh();
    });
  }, [pathname, lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ autoRaf: false }}>
      <ScrollManager />
      {children}
    </ReactLenis>
  );
}