"use client";

import { useLenis } from "lenis/react";
import { NAV_ITEMS } from "@/lib/nav";
import { useActiveSection } from "@/lib/useActiveSection";
import { Logo } from "@/components/ui/Logo";

export function Sidebar() {
  const active = useActiveSection();
  const lenis = useLenis();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!lenis) return;
    e.preventDefault();
    lenis.scrollTo(`#${id}`);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <aside className="fixed top-0 left-0 z-40 hidden flex-col pt-10 pl-(--grid-margin) lg:flex">
      <Logo onClick={(e) => handleClick(e, "intro")} className="text-3xl" />

      <nav aria-label="Main" className="mt-24">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={`text-md transition-colors duration-300 ${
                    isActive ? "text-fg font-semibold" : "text-muted hover:text-fg"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}