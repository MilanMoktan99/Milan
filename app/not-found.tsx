import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — Milan Moktan",
  robots: { index: false, follow: true },
};

const linkClass =
  "rounded-sm underline decoration-fg/35 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-300 hover:decoration-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export default function NotFound() {
  return (
    <main className="site-grid min-h-svh content-center py-24">
      <div className="col-span-full lg:col-span-8 lg:col-start-3">
        <p className="flex items-center gap-2 text-sm font-medium tracking-wide text-muted uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          404
        </p>

        <h1 className="mt-6 text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] font-medium tracking-[-0.04em]">
          This page
          <br />
          <span className="text-muted">doesn&apos;t exist.</span>
        </h1>

        <p className="mt-8 max-w-[46ch] text-lg leading-snug text-muted">
          The link may be out of date, or the address might have a typo. My work
          is all still here though.
        </p>

        <nav aria-label="Where to go next" className="mt-10">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-lg">
            <li>
              <Link href="/" className={linkClass}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/#work" className={linkClass}>
                Work
              </Link>
            </li>
            <li>
              <Link href="/#about" className={linkClass}>
                About
              </Link>
            </li>
            <li>
              <Link href="/#contact" className={linkClass}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </main>
  );
}
