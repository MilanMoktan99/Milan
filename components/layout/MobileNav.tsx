"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { NAV_ITEMS } from "@/lib/nav";
import { useActiveSection } from "@/lib/useActiveSection";
import { Logo } from "@/components/ui/Logo";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const lenis = useLenis();
  const menuRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      tl.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: "power3.out", duration: reduce ? 0 : 0.5 },
        })
        .to(menuRef.current, { autoAlpha: 1, duration: reduce ? 0 : 0.3 })
        .from(".mobile-link", { yPercent: 100, stagger: 0.06 }, "<0.1");
    },
    { scope: menuRef }
  );

  // Play/reverse animation and lock scrolling
  useEffect(() => {
    if (open) {
      tl.current?.play();
      lenis?.stop();
    } else {
      tl.current?.reverse();
      lenis?.start();
    }
  }, [open, lenis]);

  // Close on Escape, or if the window grows to desktop size
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onResize = () => desktop.matches && setOpen(false);

    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  const goTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    if (lenis) {
      lenis.start();
      lenis.scrollTo(`#${id}`, { offset: -64 });
    } else {
      document.getElementById(id)?.scrollIntoView();
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-bg px-5 lg:hidden">
        <Logo onClick={(e) => goTo(e, "intro")} className="text-2xl" />

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="relative -mr-2 size-10"
        >
          <span
            className={`absolute inset-x-2 top-1/2 -mt-px h-0.5 bg-fg transition-transform duration-300 ${
              open ? "rotate-45" : "-translate-y-1"
            }`}
          />
          <span
            className={`absolute inset-x-2 top-1/2 -mt-px h-0.5 bg-fg transition-transform duration-300 ${
              open ? "-rotate-45" : "translate-y-1"
            }`}
          />
        </button>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        inert={!open}
        className="invisible fixed inset-0 z-40 flex flex-col justify-center bg-bg px-5 opacity-0 lg:hidden"
      >
        <nav aria-label="Main">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.id} className="overflow-hidden">
                <a
                  href={`#${item.id}`}
                  onClick={(e) => goTo(e, item.id)}
                  aria-current={active === item.id ? "location" : undefined}
                  className={`mobile-link block text-5xl font-medium ${
                    active === item.id ? "text-fg" : "text-muted"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}