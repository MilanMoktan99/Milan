import type { HeroContent } from "@/types";

export const DEFAULT_HERO: HeroContent = {
  eyebrow: "Milan Moktan — UI/UX Designer & Web Developer",
  designWord: "Designer",
  devWord: "Developer",
  frameLabel: "Frame — UI/UX",
  headingAlt: "Milan Moktan, UI/UX Designer and Web Developer",
  summary:
    "I design interfaces in Figma and build them with Next.js and React, so the product that ships looks and works the way it was designed.",
  location: "Based in Kathmandu, Nepal",
  availability: "Open to freelance and full-time roles",
  stack: [
    { label: "Design", items: ["Figma", "Canva"] },
    {
      label: "Build",
      items: ["Next.js", "React", "Tailwind CSS", "Firebase", "MongoDB", "SQL"],
    },
  ],
};
