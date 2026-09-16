import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";

export function SimpleFooter() {
  return (
    <footer className="site-grid mt-32 border-t border-border pt-10 pb-32 lg:mt-48 lg:pb-10">
      <div className="col-span-full lg:col-span-10 lg:col-start-3">
        <Link
          href="/#intro"
          scroll={false}
          className="group inline-flex items-center gap-3 rounded-sm text-[clamp(1.75rem,4vw,3rem)] leading-none font-medium tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <ArrowLeftIcon className="size-[0.7em] transition-transform duration-300 group-hover:-translate-x-1" />
          Back to home
        </Link>
        <p className="mt-8 text-sm text-muted">
          © {new Date().getFullYear()} Milan Moktan
        </p>
      </div>
    </footer>
  );
}