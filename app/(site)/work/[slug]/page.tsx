import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/projects";
import { PROJECT_TYPE_LABEL } from "@/lib/project-labels";
import { CaseStudyViewer } from "@/components/case-study/CaseStudyViewer";
import { ProjectTopBar } from "@/components/case-study/ProjectTopBar";
import { MoreWork } from "@/components/case-study/MoreWork";
import { SimpleFooter } from "@/components/case-study/SimpleFooter";
import { ArrowUpRightIcon } from "@/components/ui/icons";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found — Milan Moktan" };

  const description =
    project.summary ||
    `${PROJECT_TYPE_LABEL[project.type]} by Milan Moktan${
      project.timeline ? `, ${project.timeline}` : ""
    }.`;

  return {
    title: `${project.name} — Milan Moktan`,
    description,
    openGraph: {
      title: project.name,
      description,
      images: [{ url: project.coverImage, alt: project.coverAlt }],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const others = (await getProjects())
    .filter((item) => item.slug !== slug)
    .slice(0, 3);

  const buttonClass =
    "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <>
      <ProjectTopBar name={project.name} />

      <main>
        <header className="site-grid pt-16 pb-12 lg:pt-24 lg:pb-16">
          <div className="col-span-full lg:col-span-10 lg:col-start-3">
            <p className="text-sm font-medium tracking-wide text-muted uppercase">
              {PROJECT_TYPE_LABEL[project.type]}
              {project.timeline && (
                <>
                  <span aria-hidden> · </span>
                  {project.timeline}
                </>
              )}
            </p>

            <h1 className="mt-4 text-[clamp(2.75rem,7vw,7rem)] leading-[0.95] font-medium tracking-[-0.04em] text-balance">
              {project.name}
            </h1>

            {(project.liveUrl || project.pdfUrl) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonClass} border-fg bg-fg text-bg hover:bg-transparent hover:text-fg`}
                  >
                    Visit live site
                    <ArrowUpRightIcon />
                  </a>
                )}
                {project.pdfUrl && (
                  <a
                    href={project.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonClass} border-fg/25 hover:border-fg`}
                  >
                    Open PDF
                    <ArrowUpRightIcon />
                  </a>
                )}
              </div>
            )}
          </div>
        </header>

        <section aria-label={`${project.name} case study`} className="site-grid">
          <div className="col-span-full lg:col-span-8 lg:col-start-3">
            {project.pdfUrl ? (
              <CaseStudyViewer url={project.pdfUrl} title={project.name} />
            ) : (
              <div className="relative aspect-[16/10] overflow-clip rounded-sm bg-fg/5">
                <Image
                  src={project.coverImage}
                  alt={project.coverAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {others.length > 0 && <MoreWork projects={others} />}
      </main>

      <SimpleFooter />
    </>
  );
}