import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminAbout } from "@/lib/server/admin-projects";
import { AboutForm } from "@/components/admin/AboutForm";

export default async function AdminAboutPage() {
  await requireAdmin();
  const about = await getAdminAbout();

  return (
    <>
      <Link
        href="/admin"
        className="text-sm text-muted transition-colors hover:text-fg"
      >
        ← All projects
      </Link>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">
        About section
      </h1>
      <p className="mt-1 text-sm text-muted">
        Your photo, bio, values, and experience.
      </p>

      <AboutForm initial={about} />
    </>
  );
}
