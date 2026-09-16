import Image from "next/image";
import Link from "next/link";
import { PROJECT_ACTION_LABEL, PROJECT_TYPE_LABEL } from "@/lib/project-labels";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Project } from "@/types";

export function MoreWork({ projects }: { projects: Project[] }) {
  return (
    <section aria-labelledby="more-work" className="site-grid mt-32 lg:mt-48">
      <div className="col-span-full lg:col-span-10 lg:col-start-3">
        <h2
          id="more-work"
          className="border-b border-border pb-6 text-[clamp(2rem,4vw,3.5rem)] leading-none font-medium tracking-[-0.03em]"
        >
          More work
        </h2>

        <ul className="mt-10 grid gap-x-5 gap-y-12 md:grid-cols-3">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                href={`/work/${project.slug}`}
                className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <div className="relative aspect-[4/3] overflow-clip rounded-sm bg-fg/5">
                  <Image
                    src={project.coverImage}
                    alt={project.coverAlt}
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover transition-[scale] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
                  />
                </div>
                <h3 className="mt-4 text-xl font-medium">{project.name}</h3>
                <p className="mt-1 text-sm text-muted">
                  {PROJECT_TYPE_LABEL[project.type]}
                  {project.timeline && (
                    <>
                      <span aria-hidden> · </span>
                      {project.timeline}
                    </>
                  )}
                </p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium">
                  {PROJECT_ACTION_LABEL[project.type]}
                  <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}