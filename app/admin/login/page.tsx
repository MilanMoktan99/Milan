import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/server/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="grid min-h-svh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <p className="text-sm text-muted">Milan Moktan</p>
        <h1 className="mt-1 text-3xl font-medium tracking-tight">Admin</h1>
        <LoginForm />
      </div>
    </main>
  );
}