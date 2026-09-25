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
import { collectPublicIds, parseBlocks } from "@/lib/blocks";
import type {
  AboutContent,
  CaseStudyBlock,
  ContactContent,
  HeroContent,
  ProjectInput,
} from "@/types";

type Result = { ok: true } | { ok: false; error: string };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SESSION_EXPIRED = "Your session expired. Please log in again.";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fail = (error: string): Result => ({ ok: false, error });
const clean = (value: string) => value.trim();

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
      cloudinary.uploader.destroy(id, {
        resource_type: "image",
        invalidate: true,
      }),
    ),
  );
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("[admin] Cloudinary cleanup failed:", result.reason);
    }
  });
}

function refreshSite(slug?: string) {
  revalidatePath("/");
  revalidatePath("/work/[slug]", "page");
  if (slug) revalidatePath(`/work/${slug}`);
}

/* ---------- Auth ---------- */

export type LoginState = { error: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData,
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
  if (slug !== "about" && !SLUG_RE.test(slug)) {
    return {
      ok: false as const,
      error: "Add a valid project name and slug before uploading.",
    };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error(
      "[admin] Missing CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET",
    );
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
  mode: "create" | "edit",
): Promise<Result> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);

  const { cloudName } = getCloudinary();
  const slug = clean(input.slug);
  const name = clean(input.name);
  const liveUrl = input.liveUrl?.trim() || null;
  const order = Number(input.order);

  if (!SLUG_RE.test(slug)) {
    return fail(
      "The slug can only use lowercase letters, numbers, and hyphens.",
    );
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
    timeline: clean(input.timeline),
    summary: clean(input.summary).slice(0, 300),
    coverImage: input.coverImage,
    coverPublicId: input.coverPublicId || null,
    coverAlt: clean(input.coverAlt),
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
      await ref.create({
        ...data,
        blocks: [],
        createdAt: FieldValue.serverTimestamp(),
      });
    } else {
      const existing = await ref.get();
      if (!existing.exists) return fail("This project no longer exists.");

      const previous = existing.data()!;
      await ref.set(data, { merge: true });

      // Remove files that were replaced or removed
      await destroyAssets([
        previous.coverPublicId !== data.coverPublicId
          ? previous.coverPublicId
          : null,
        previous.pdfPublicId !== data.pdfPublicId ? previous.pdfPublicId : null,
      ]);
    }
  } catch (error) {
    if ((error as { code?: number }).code === 6) {
      return fail(`A project with the slug "${slug}" already exists.`);
    }
    console.error("[admin] Failed to save project:", error);
    return fail(
      "Something went wrong while saving. Check the terminal for details.",
    );
  }

  refreshSite(slug);
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
    await destroyAssets([
      data.coverPublicId,
      data.pdfPublicId,
      ...collectPublicIds(parseBlocks(data.blocks)),
    ]);
  } catch (error) {
    console.error("[admin] Failed to delete project:", error);
    return fail("Something went wrong while deleting.");
  }

  refreshSite(slug);
  return { ok: true };
}

/* ---------- Case study blocks ---------- */

export async function saveCaseStudy(
  slug: string,
  blocks: CaseStudyBlock[],
): Promise<Result> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);
  if (!SLUG_RE.test(slug)) return fail("Invalid project.");

  const { cloudName } = getCloudinary();
  const parsed = parseBlocks(blocks);

  const urls = parsed.flatMap((block) =>
    block.type === "image"
      ? [block.image.url]
      : block.type === "gallery"
        ? block.images.map((image) => image.url)
        : [],
  );
  if (urls.some((url) => !isCloudinaryUrl(url, cloudName))) {
    return fail("Upload images using this form.");
  }

  try {
    const ref = adminDb().collection("projects").doc(slug);
    const snapshot = await ref.get();
    if (!snapshot.exists) return fail("This project no longer exists.");

    const previousIds = collectPublicIds(parseBlocks(snapshot.data()?.blocks));
    const nextIds = new Set(collectPublicIds(parsed));

    await ref.set(
      { blocks: parsed, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );

    await destroyAssets(previousIds.filter((id) => !nextIds.has(id)));
  } catch (error) {
    console.error("[admin] Failed to save case study:", error);
    return fail(
      "Something went wrong while saving. Check the terminal for details.",
    );
  }

  refreshSite(slug);
  return { ok: true };
}

/* ---------- About ---------- */

export async function saveAbout(input: AboutContent): Promise<Result> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);

  const { cloudName } = getCloudinary();
  const photoUrl = clean(input.photoUrl);

  if (photoUrl && !isCloudinaryUrl(photoUrl, cloudName)) {
    return fail("Upload your photo using this form.");
  }
  if (!clean(input.lead)) return fail("Add an opening line for your bio.");

  const data = {
    photoUrl,
    photoPublicId: photoUrl ? input.photoPublicId : "",
    photoAlt: clean(input.photoAlt),
    lead: clean(input.lead),
    paragraphs: input.paragraphs.map(clean).filter(Boolean),
    values: input.values.map(clean).filter(Boolean),
    experience: input.experience
      .filter((item) => item.role.trim() || item.company.trim())
      .map((item, i) => ({
        id: item.id || `exp-${Date.now()}-${i}`,
        period: clean(item.period),
        role: clean(item.role),
        company: clean(item.company),
        type: clean(item.type),
        description: clean(item.description),
      })),
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    const ref = adminDb().collection("content").doc("about");
    const existing = await ref.get();
    const previousPhotoId = existing.exists
      ? existing.data()?.photoPublicId
      : null;

    await ref.set(data, { merge: true });

    if (previousPhotoId && previousPhotoId !== data.photoPublicId) {
      await destroyAssets([previousPhotoId]);
    }
  } catch (error) {
    console.error("[admin] Failed to save About:", error);
    return fail(
      "Something went wrong while saving. Check the terminal for details.",
    );
  }

  revalidatePath("/");
  return { ok: true };
}

/* ---------- Hero ---------- */

export async function saveHero(input: HeroContent): Promise<Result> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);

  if (!clean(input.designWord) || !clean(input.devWord)) {
    return fail("Both headline words are required.");
  }
  if (!clean(input.headingAlt)) {
    return fail("Add a plain-text version of the headline for screen readers.");
  }

  const data = {
    eyebrow: clean(input.eyebrow),
    designWord: clean(input.designWord),
    devWord: clean(input.devWord),
    frameLabel: clean(input.frameLabel),
    headingAlt: clean(input.headingAlt),
    summary: clean(input.summary),
    location: clean(input.location),
    availability: clean(input.availability),
    stack: input.stack
      .map((group) => ({
        label: clean(group.label),
        items: group.items.map(clean).filter(Boolean),
      }))
      .filter((group) => group.items.length > 0),
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    await adminDb()
      .collection("content")
      .doc("hero")
      .set(data, { merge: true });
  } catch (error) {
    console.error("[admin] Failed to save Hero:", error);
    return fail(
      "Something went wrong while saving. Check the terminal for details.",
    );
  }

  revalidatePath("/");
  return { ok: true };
}

/* ---------- Contact ---------- */

export async function saveContact(input: ContactContent): Promise<Result> {
  if (!(await isAdmin())) return fail(SESSION_EXPIRED);

  const email = clean(input.email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("Add a valid email address.");
  }
  if (!clean(input.message)) return fail("Add a message line.");

  const socials = input.socials
    .map((item, i) => ({
      id: item.id || `social-${Date.now()}-${i}`,
      label: clean(item.label),
      href: clean(item.href),
    }))
    .filter((item) => item.label || item.href);

  const invalid = socials.find((item) => !isWebUrl(item.href));
  if (invalid) {
    return fail(
      `The ${invalid.label || "social"} link must start with https://`,
    );
  }

  try {
    await adminDb()
      .collection("content")
      .doc("contact")
      .set(
        {
          availability: clean(input.availability),
          message: clean(input.message),
          email,
          socials,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
  } catch (error) {
    console.error("[admin] Failed to save Contact:", error);
    return fail(
      "Something went wrong while saving. Check the terminal for details.",
    );
  }

  revalidatePath("/");
  return { ok: true };
}
