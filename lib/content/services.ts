export type Service = {
  title: string;
  description: string;
  includes: string[];
};

export const SERVICES: Service[] = [
  {
    title: "UI/UX Design",
    description:
      "Clean, user-centered interfaces for websites and web apps, designed around how people actually use them.",
    includes: ["Web apps", "Dashboards", "Landing pages", "Redesigns"],
  },
  {
    title: "Mobile App Design",
    description:
      "App experiences with clear navigation, consistent layouts, and interactions that feel natural on a phone.",
    includes: ["iOS & Android", "Onboarding flows", "App redesigns", "UI kits"],
  },
  {
    title: "Wireframing & Prototyping",
    description:
      "Turning ideas into wireframes and clickable prototypes, so flows can be tested before anything gets built.",
    includes: ["User flows", "Wireframes", "Figma prototypes", "Usability testing"],
  },
  {
    title: "Design Systems",
    description:
      "Reusable components and clear rules for type, color, and spacing that keep a product consistent as it grows.",
    includes: ["Component libraries", "Style guides", "Design tokens", "Developer handoff"],
  },
  {
    title: "UX Research",
    description:
      "Understanding users' goals and pain points, then using what I learn to shape better product decisions.",
    includes: ["User interviews", "UX audits", "Competitor analysis", "Personas"],
  },
  {
    title: "Web Development",
    description:
      "Fast, responsive websites built from my own designs, with a backend when the project needs one.",
    includes: ["Next.js & React", "Tailwind CSS", "Firebase", "Responsive builds"],
  },
];