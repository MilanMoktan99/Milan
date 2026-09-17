import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminProject } from "@/lib/server/admin-projects";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default async function EditProjectPage({
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
      <Link href="/admin" className="text-sm text-muted transition-colors hover:text-fg">
        ← All projects
      </Link>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">
        Edit “{project.name || project.slug}”
      </h1>

      <ProjectForm mode="edit" initial={project} />
    </>
  );
}