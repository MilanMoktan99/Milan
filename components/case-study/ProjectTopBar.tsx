"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { session } from "@/lib/session";
import { ArrowLeftIcon } from "@/components/ui/icons";

export function ProjectTopBar({ name }: { name: string }) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let Cmd/Ctrl-click still open a new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    if (session.homeScroll !== null) {
      e.preventDefault();
      router.push("/", { scroll: false });
    }
  };

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="site-grid h-16 items-center">
        <Link
          href="/#work"
          scroll={false}
          onClick={handleBack}
          className="group col-span-2 inline-flex w-fit items-center gap-2 rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <ArrowLeftIcon className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to work
        </Link>
        <p className="col-span-2 truncate text-right text-sm text-muted md:col-span-6 lg:col-span-10">
          {name}
        </p>
      </div>
    </div>
  );
}