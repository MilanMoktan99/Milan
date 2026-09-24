import type { AboutContent } from "@/types";

export const DEFAULT_ABOUT: AboutContent = {
  photoUrl: "",
  photoPublicId: "",
  photoAlt: "Portrait of Milan Moktan",
  lead: "Hi, I'm Milan, a UI/UX designer and web developer based in Kathmandu, Nepal. I design in Figma and build with code, so I care about how things look and how they work once they ship.",
  paragraphs: [
    "I like design that's simple and bold. Clean layouts with nothing extra, type with real confidence, and details that hold up when you look closely. When something is well made, it usually ends up beautiful too.",
    "To me, design is one of the most creative spaces there is. Every project starts with a new problem, and I find inspiration for solving it almost everywhere I look.",
  ],
  values: ["Simplicity", "Boldness", "Minimalism", "Craft", "Beauty"],
  experience: [
    {
      id: "freelance",
      period: "2025 — Present",
      role: "UI/UX Designer & Developer",
      company: "Freelance",
      type: "Remote",
      description:
        "Designing and building websites and apps for clients, from first wireframes in Figma to the finished product.",
    },
  ],
};
