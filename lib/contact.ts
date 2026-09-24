// Server-only: import this from server components.
import { cache } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_CONTACT } from "@/lib/content/contact";
import type { ContactContent, SocialLink } from "@/types";

const str = (value: unknown, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

function toSocial(value: unknown, index: number): SocialLink | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const label = str(item.label);
  const href = str(item.href);
  if (!label || !/^https?:\/\//i.test(href)) return null;
  return { id: str(item.id) || `social-${index}`, label, href };
}

export const getContact = cache(async (): Promise<ContactContent> => {
  try {
    const snapshot = await getDoc(doc(db, "content", "contact"));
    if (!snapshot.exists()) return DEFAULT_CONTACT;

    const data = snapshot.data();
    const socials = Array.isArray(data.socials)
      ? data.socials
          .map(toSocial)
          .filter((item): item is SocialLink => item !== null)
      : [];

    return {
      availability: str(data.availability),
      message: str(data.message, DEFAULT_CONTACT.message),
      email: str(data.email, DEFAULT_CONTACT.email),
      socials,
    };
  } catch (error) {
    console.error("[contact] Failed to load Contact content:", error);
    return DEFAULT_CONTACT;
  }
});
