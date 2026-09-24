import "server-only";
import type { DocumentData } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";
import type { AdminProject } from "@/types";
import { DEFAULT_ABOUT } from "@/lib/content/about";
import type { AboutContent } from "@/types";
import { DEFAULT_HERO } from "@/lib/content/hero";
import type { HeroContent } from "@/types";
import { DEFAULT_CONTACT } from "@/lib/content/contact";
import type { ContactContent } from "@/types";

const str = (value: unknown) => (typeof value === "string" ? value : "");
const strOrNull = (value: unknown) =>
  typeof value === "string" && value ? value : null;

function toAdminProject(slug: string, data: DocumentData): AdminProject {
  return {
    slug,
    name: str(data.name),
    type: data.type === "development" ? "development" : "design",
    timeline: str(data.timeline),
    summary: str(data.summary),
    coverImage: str(data.coverImage),
    coverPublicId: str(data.coverPublicId),
    coverAlt: str(data.coverAlt),
    pdfUrl: strOrNull(data.pdfUrl),
    pdfPublicId: strOrNull(data.pdfPublicId),
    liveUrl: strOrNull(data.liveUrl),
    featured: data.featured === true,
    published: data.published === true,
    order: typeof data.order === "number" ? data.order : 999,
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? null,
  };
}

export async function listAllProjects() {
  const snapshot = await adminDb().collection("projects").get();
  return snapshot.docs
    .map((doc) => toAdminProject(doc.id, doc.data()))
    .sort((a, b) => a.order - b.order);
}

export async function getAdminProject(slug: string) {
  const doc = await adminDb().collection("projects").doc(slug).get();
  return doc.exists ? toAdminProject(doc.id, doc.data()!) : null;
}

export async function getAdminAbout(): Promise<AboutContent> {
  const snapshot = await adminDb().collection("content").doc("about").get();
  if (!snapshot.exists) return DEFAULT_ABOUT;

  const data = snapshot.data()!;
  return {
    photoUrl: str(data.photoUrl),
    photoPublicId: str(data.photoPublicId),
    photoAlt: str(data.photoAlt),
    lead: str(data.lead),
    paragraphs: Array.isArray(data.paragraphs)
      ? data.paragraphs.map(String)
      : [],
    values: Array.isArray(data.values) ? data.values.map(String) : [],
    experience: Array.isArray(data.experience)
      ? data.experience.map((item, i) => ({
          id: str((item as Record<string, unknown>)?.id) || `exp-${i}`,
          period: str((item as Record<string, unknown>)?.period),
          role: str((item as Record<string, unknown>)?.role),
          company: str((item as Record<string, unknown>)?.company),
          type: str((item as Record<string, unknown>)?.type),
          description: str((item as Record<string, unknown>)?.description),
        }))
      : [],
  };
}

export async function getAdminHero(): Promise<HeroContent> {
  const snapshot = await adminDb().collection("content").doc("hero").get();
  if (!snapshot.exists) return DEFAULT_HERO;

  const data = snapshot.data()!;
  return {
    eyebrow: str(data.eyebrow),
    designWord: str(data.designWord),
    devWord: str(data.devWord),
    frameLabel: str(data.frameLabel),
    headingAlt: str(data.headingAlt),
    summary: str(data.summary),
    location: str(data.location),
    availability: str(data.availability),
    stack: Array.isArray(data.stack)
      ? data.stack.map((group) => {
          const item = group as Record<string, unknown>;
          return {
            label: str(item.label),
            items: Array.isArray(item.items) ? item.items.map(String) : [],
          };
        })
      : [],
  };
}

export async function getAdminContact(): Promise<ContactContent> {
  const snapshot = await adminDb().collection("content").doc("contact").get();
  if (!snapshot.exists) return DEFAULT_CONTACT;

  const data = snapshot.data()!;
  return {
    availability: str(data.availability),
    message: str(data.message),
    email: str(data.email),
    socials: Array.isArray(data.socials)
      ? data.socials.map((item, i) => {
          const social = item as Record<string, unknown>;
          return {
            id: str(social.id) || `social-${i}`,
            label: str(social.label),
            href: str(social.href),
          };
        })
      : [],
  };
}
