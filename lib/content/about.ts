export const ABOUT = {
  photo: {
    // Paste your Cloudinary photo URL here. Leave empty to show a placeholder.
    src: "https://res.cloudinary.com/dzwhs8djm/image/upload/v1789567181/profile.jpg",
    alt: "Portrait of Milan Moktan",
  },
  lead:
    "Hi, I'm Milan, a UI/UX designer and web developer based in Kathmandu, Nepal. I design in Figma and build with code, so I care about how things look and how they work once they ship.",
  paragraphs: [
    "I like design that's simple and bold. Clean layouts with nothing extra, type with real confidence, and details that hold up when you look closely. When something is well made, it usually ends up beautiful too.",
    "To me, design is one of the most creative spaces there is. Every project starts with a new problem, and I find inspiration for solving it almost everywhere I look.",
  ],
  values: ["Simplicity", "Boldness", "Minimalism", "Craft", "Beauty"],
};

export type Experience = {
  period: string;
  role: string;
  company: string;
  type: string;
  description?: string;
};

// Replace these placeholders with your real experience, newest first.
export const EXPERIENCE: Experience[] = [
  {
    period: "2025 — Present",
    role: "UI/UX Designer & Developer",
    company: "Freelance",
    type: "Remote",
    description:
      "Designing and building websites and apps for clients, from first wireframes in Figma to the finished product.",
  },
  {
    period: "2026 Kathmandu",
    role: "UI/UX Designer",
    company: "SquareLabs pvt. ltd.",
    type: "Hybrid",
    description: "I designed on different projects, including web and mobile apps, and collaborated with developers to bring them to life.",
  },
];