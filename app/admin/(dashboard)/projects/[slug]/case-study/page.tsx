import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminProject } from "@/lib/server/admin-projects";
import { BlockEditor } from "@/components/admin/BlockEditor";

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();

  const { slug } = await params;
  const project = await getAdminProject(slug);
  if (!project) notFound();

  return (
    <>
      <Link
        href="/admin"
        className="text-sm text-muted transition-colors hover:text-fg"
      >
        ← All projects
      </Link>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">
        Case study: {project.name || project.slug}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Build the page section by section. If you add sections here, they
        replace the PDF on this project&apos;s page.
      </p>

      <BlockEditor
        slug={project.slug}
        projectName={project.name || project.slug}
        initial={project.blocks}
      />
    </>
  );
}
