// Server-only: import this from server components.
import { cache } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_HERO } from "@/lib/content/hero";
import type { HeroContent, StackGroup } from "@/types";

const str = (value: unknown, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

function toGroup(value: unknown): StackGroup | null {
  if (!value || typeof value !== "object") return null;
  const group = value as Record<string, unknown>;
  const items = Array.isArray(group.items)
    ? group.items.filter(
        (item): item is string => typeof item === "string" && !!item.trim(),
      )
    : [];
  if (items.length === 0) return null;
  return { label: str(group.label), items };
}

export const getHero = cache(async (): Promise<HeroContent> => {
  try {
    const snapshot = await getDoc(doc(db, "content", "hero"));
    if (!snapshot.exists()) return DEFAULT_HERO;

    const data = snapshot.data();
    const stack = Array.isArray(data.stack)
      ? data.stack
          .map(toGroup)
          .filter((group): group is StackGroup => group !== null)
      : [];

    return {
      eyebrow: str(data.eyebrow, DEFAULT_HERO.eyebrow),
      designWord: str(data.designWord, DEFAULT_HERO.designWord),
      devWord: str(data.devWord, DEFAULT_HERO.devWord),
      frameLabel: str(data.frameLabel, DEFAULT_HERO.frameLabel),
      headingAlt: str(data.headingAlt, DEFAULT_HERO.headingAlt),
      summary: str(data.summary, DEFAULT_HERO.summary),
      location: str(data.location),
      availability: str(data.availability),
      stack,
    };
  } catch (error) {
    console.error("[hero] Failed to load Hero content:", error);
    return DEFAULT_HERO;
  }
});
