// Server-only: import this from server components, never from "use client" files.
import { cache } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseBlocks } from "@/lib/blocks";
import type { Project } from "@/types";

const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

function toProject(slug: string, data: DocumentData): Project | null {
  const name = text(data.name);
  const coverImage = text(data.coverImage);
  if (!name || !coverImage) return null;

  return {
    slug,
    name,
    type: data.type === "development" ? "development" : "design",
    timeline: text(data.timeline) ?? "",
    coverImage,
    coverAlt: text(data.coverAlt) ?? `Cover image for ${name}`,
    pdfUrl: text(data.pdfUrl),
    liveUrl: text(data.liveUrl),
    summary: text(data.summary) ?? "",
    featured: data.featured === true,
    order: typeof data.order === "number" ? data.order : 999,
    blocks: parseBlocks(data.blocks),
  };
}

export const getProjects = cache(async (): Promise<Project[]> => {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "projects"),
        where("published", "==", true),
        orderBy("order"),
      ),
    );
    return snapshot.docs
      .map((doc) => toProject(doc.id, doc.data()))
      .filter((project): project is Project => project !== null);
  } catch (error) {
    console.error("[projects] Failed to load projects:", error);
    return [];
  }
});

export async function getFeaturedProjects(limit = 5) {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);
  return (featured.length > 0 ? featured : projects).slice(0, limit);
}

export async function getProject(slug: string) {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}
