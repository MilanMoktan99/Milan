import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminContact } from "@/lib/server/admin-projects";
import { ContactForm } from "@/components/admin/ContactForm";

export default async function AdminContactPage() {
  await requireAdmin();
  const contact = await getAdminContact();

  return (
    <>
      <Link href="/admin" className="text-sm text-muted transition-colors hover:text-fg">
        ← All projects
      </Link>
      <h1 className="mt-4 text-3xl font-medium tracking-tight">Contact section</h1>
      <p className="mt-1 text-sm text-muted">Your email, message, and links.</p>

      <ContactForm initial={contact} />
    </>
  );
}