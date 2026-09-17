"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/app/admin/actions";

export function DeleteProjectButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    const confirmed = window.confirm(
      `Delete "${name}"? This also removes its cover and PDF from Cloudinary, and it can't be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteProject(slug);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-muted transition-colors hover:text-fg disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}