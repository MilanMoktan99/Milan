import "server-only";
import type { DocumentData } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";
import type { AdminProject } from "@/types";

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