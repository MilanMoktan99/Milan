import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { logout } from "@/app/admin/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link href="/admin" className="font-medium">
            Admin
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/"
              target="_blank"
              className="text-muted transition-colors hover:text-fg"
            >
              View site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-muted transition-colors hover:text-fg"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
    </>
  );
}