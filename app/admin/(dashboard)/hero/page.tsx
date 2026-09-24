import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminHero } from "@/lib/server/admin-projects";
import { HeroForm } from "@/components/admin/HeroForm";

export default async function AdminHeroPage() {
  await requireAdmin();
  const hero = await getAdminHero();

  return (
    <>
      <Link
        href="/admin"
        className="text-sm text-muted transition-colors hover:text-fg"
      >
        ← All projects
      </Link>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">
        Intro section
      </h1>
      <p className="mt-1 text-sm text-muted">
        Your headline, summary, tools, and availability.
      </p>

      <HeroForm initial={hero} />
    </>
  );
}
