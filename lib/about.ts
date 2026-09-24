// Server-only: import this from server components.
import { cache } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_ABOUT } from "@/lib/content/about";
import type { AboutContent, Experience } from "@/types";

const str = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const strList = (value: unknown) =>
  Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string" && !!item.trim(),
      )
    : [];

function toExperience(value: unknown, index: number): Experience | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const role = str(item.role).trim();
  const company = str(item.company).trim();
  if (!role && !company) return null;

  return {
    id: str(item.id) || `exp-${index}`,
    period: str(item.period).trim(),
    role,
    company,
    type: str(item.type).trim(),
    description: str(item.description).trim(),
  };
}

export const getAbout = cache(async (): Promise<AboutContent> => {
  try {
    const snapshot = await getDoc(doc(db, "content", "about"));
    if (!snapshot.exists()) return DEFAULT_ABOUT;

    const data = snapshot.data();
    const paragraphs = strList(data.paragraphs);
    const experience = Array.isArray(data.experience)
      ? data.experience
          .map(toExperience)
          .filter((item): item is Experience => item !== null)
      : [];

    return {
      photoUrl: str(data.photoUrl, DEFAULT_ABOUT.photoUrl),
      photoPublicId: str(data.photoPublicId),
      photoAlt: str(data.photoAlt, DEFAULT_ABOUT.photoAlt),
      lead: str(data.lead).trim() || DEFAULT_ABOUT.lead,
      paragraphs: paragraphs.length ? paragraphs : DEFAULT_ABOUT.paragraphs,
      values: strList(data.values),
      experience,
    };
  } catch (error) {
    console.error("[about] Failed to load About content:", error);
    return DEFAULT_ABOUT;
  }
});
