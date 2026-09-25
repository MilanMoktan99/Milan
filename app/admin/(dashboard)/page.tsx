import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { listAllProjects } from "@/lib/server/admin-projects";
import { PROJECT_TYPE_LABEL } from "@/lib/project-labels";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import { btnPrimary, btnSecondary } from "@/components/admin/styles";

function Badge({ on, children }: { on?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 ${on ? "bg-fg text-bg" : "bg-fg/10 text-muted"}`}
    >
      {children}
    </span>
  );
}

export default async function AdminHomePage() {
  await requireAdmin();

  const projects = await listAllProjects().catch((error) => {
    console.error("[admin] Failed to load projects:", error);
    return null;
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            Published projects appear on your site. Featured ones show in the
            Work section.
          </p>
        </div>
        <Link href="/admin/projects/new" className={btnPrimary}>
          New project
        </Link>
      </div>

      {projects === null ? (
        <p
          role="alert"
          className="mt-10 rounded-sm border border-border p-5 text-sm"
        >
          Couldn&apos;t load projects. Check your Firebase Admin environment
          variables and the terminal for details.
        </p>
      ) : projects.length === 0 ? (
        <p className="mt-10 text-muted">No projects yet. Add your first one.</p>
      ) : (
        <ul className="mt-10 divide-y divide-border border-y border-border">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="flex flex-wrap items-center gap-4 py-4 sm:flex-nowrap"
            >
              <div className="relative aspect-[16/10] w-28 shrink-0 overflow-clip rounded-sm bg-fg/5">
                {project.coverImage && (
                  <Image
                    src={project.coverImage}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {project.name || project.slug}
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {PROJECT_TYPE_LABEL[project.type]}
                  {project.timeline && ` · ${project.timeline}`}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <Badge on={project.published}>
                    {project.published ? "Published" : "Draft"}
                  </Badge>
                  {project.featured && <Badge on>Featured</Badge>}
                  <Badge>Order {project.order}</Badge>
                  {project.blocks.length > 0 && (
                    <Badge>{project.blocks.length} sections</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {project.published && (
                  <Link
                    href={`/work/${project.slug}`}
                    target="_blank"
                    className="text-sm text-muted transition-colors hover:text-fg"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/admin/projects/${project.slug}/case-study`}
                  className="text-sm text-muted transition-colors hover:text-fg"
                >
                  Case study
                </Link>
                <Link
                  href={`/admin/projects/${project.slug}`}
                  className={btnSecondary}
                >
                  Edit
                </Link>
                <DeleteProjectButton
                  slug={project.slug}
                  name={project.name || project.slug}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
