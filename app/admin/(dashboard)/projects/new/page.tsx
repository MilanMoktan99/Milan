import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { listAllProjects } from "@/lib/server/admin-projects";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default async function NewProjectPage() {
  await requireAdmin();

  const projects = await listAllProjects().catch(() => []);
  const nextOrder =
    projects.reduce(
      (max, project) => (project.order === 999 ? max : Math.max(max, project.order)),
      0
    ) + 1;

  return (
    <>
      <Link href="/admin" className="text-sm text-muted transition-colors hover:text-fg">
        ← All projects
      </Link>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">New project</h1>

      <ProjectForm
        mode="create"
        initial={{
          slug: "",
          name: "",
          type: "design",
          timeline: "",
          summary: "",
          coverImage: "",
          coverPublicId: "",
          coverAlt: "",
          pdfUrl: null,
          pdfPublicId: null,
          liveUrl: null,
          featured: true,
          published: false,
          order: nextOrder,
        }}
      />
    </>
  );
}