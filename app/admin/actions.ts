"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";
import {
  checkCredentials,
  createSession,
  destroySession,
  isAdmin,
} from "@/lib/server/auth";
import { adminDb } from "@/lib/server/firebase-admin";
import { getCloudinary } from "@/lib/server/cloudinary";
import type { ProjectInput } from "@/types";

type Result = { ok: true } | { ok: false; error: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SESSION_EXPIRED = "Your session expired. Please log in again.";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = (error: string): Result => ({ ok: false, error });

function isCloudinaryUrl(url: string, cloudName: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}

function isWebUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

async function destroyAssets(publicIds: (string | null | undefined)[]) {
  const ids = publicIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;

  const { cloudinary } = getCloudinary();
  const results = await Promise.allSettled(
    ids.map((id) =>
      cloudinary.uploader.destroy(id, { resource_type: "image", invalidate: true })
    )
  );
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[admin] Cloudinary cleanup failed:", result.reason);
    }
  });
}

function refreshSite() {
  revalidatePath("/");
  revalidatePath("/work/[slug]", "page");
}

/* ---------- Auth ---------- */

export type LoginState = { error: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!checkCredentials(username, password)) {
    await sleep(1000); // slows down password guessing
    return { error: "Incorrect username or password." };
  }

  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Uploads ---------- */

export async function getUploadConfig(kind: "cover" | "pdf", slug: string) {
  if (!(await isAdmin())) {
    return { ok: false as const, error: SESSION_EXPIRED };
  }
  if (!SLUG_RE.test(slug)) {
    return {
      ok: false as const,
      error: "Add a valid project name and slug before uploading.",
    };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("[admin] Missing CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET");
    return {
      ok: false as const,
      error: "Uploads aren't configured yet. Check the terminal for details.",
    };
  }

  return {
    ok: true as const,
    cloudName,
    uploadPreset,
    folder: `portfolio/${slug}`,
    kind,
  };
}

/* ---------- Projects ---------- */

export async function saveProject(
  input: ProjectInput,
  mode: "create" | "edit"
): Promise<Result> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);

  const { cloudName, apiKey } = getCloudinary();
  console.log("[admin] Using Cloudinary key ending in", apiKey.slice(-4));
  const slug = input.slug.trim();
  const name = input.name.trim();
  const liveUrl = input.liveUrl?.trim() || null;
  const order = Number(input.order);

  if (!SLUG_RE.test(slug)) {
    return fail("The slug can only use lowercase letters, numbers, and hyphens.");
  }
  if (!name) return fail("Add a project name.");
  if (input.type !== "design" && input.type !== "development") {
    return fail("Choose a project type.");
  }
  if (!input.coverImage || !isCloudinaryUrl(input.coverImage, cloudName)) {
    return fail("Upload a cover image.");
  }
  if (input.pdfUrl && !isCloudinaryUrl(input.pdfUrl, cloudName)) {
    return fail("Upload the PDF using this form.");
  }
  if (liveUrl && !isWebUrl(liveUrl)) {
    return fail("The live site link must start with https://");
  }
  if (!Number.isFinite(order)) return fail("Order must be a number.");

  const data = {
    name,
    type: input.type,
    timeline: input.timeline.trim(),
    summary: input.summary.trim().slice(0, 300),
    coverImage: input.coverImage,
    coverPublicId: input.coverPublicId || null,
    coverAlt: input.coverAlt.trim(),
    pdfUrl: input.pdfUrl || null,
    pdfPublicId: input.pdfUrl ? input.pdfPublicId || null : null,
    liveUrl,
    featured: Boolean(input.featured),
    published: Boolean(input.published),
    order,
    updatedAt: FieldValue.serverTimestamp(),
  };

  const ref = adminDb().collection("projects").doc(slug);

  try {
    if (mode === "create") {
      await ref.create({ ...data, createdAt: FieldValue.serverTimestamp() });
    } else {
      const existing = await ref.get();
      if (!existing.exists) return fail("This project no longer exists.");

      const previous = existing.data()!;
      await ref.set(data, { merge: true });

      // Remove files that were replaced or removed
      await destroyAssets([
        previous.coverPublicId !== data.coverPublicId ? previous.coverPublicId : null,
        previous.pdfPublicId !== data.pdfPublicId ? previous.pdfPublicId : null,
      ]);
    }
  } catch (error) {
    if ((error as { code?: number }).code === 6) {
      return fail(`A project with the slug "${slug}" already exists.`);
    }
    console.error("[admin] Failed to save project:", error);
    return fail("Something went wrong while saving. Check the terminal for details.");
  }

  refreshSite();
  return { ok: true };
}

export async function deleteProject(slug: string): Promise<Result> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);

  try {
    const ref = adminDb().collection("projects").doc(slug);
    const snapshot = await ref.get();
    if (!snapshot.exists) return fail("This project no longer exists.");

    const data = snapshot.data()!;
    await ref.delete();
    await destroyAssets([data.coverPublicId, data.pdfPublicId]);
  } catch (error) {
    console.error("[admin] Failed to delete project:", error);
    return fail("Something went wrong while deleting.");
  }

  refreshSite();
  return { ok: true };
}