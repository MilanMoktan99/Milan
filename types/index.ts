export type ProjectType = "design" | "development";

export type BlockImage = {
  id: string;
  url: string;
  publicId: string;
  alt: string;
};

export type CaseStudyBlock =
  | { id: string; type: "overview"; items: { id: string; label: string; value: string }[] }
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "text"; text: string }
  | { id: string; type: "list"; title: string; items: string[] }
  | { id: string; type: "image"; image: BlockImage; caption: string; wide: boolean }
  | { id: string; type: "gallery"; images: BlockImage[]; caption: string }
  | { id: string; type: "quote"; text: string; attribution: string }
  | { id: string; type: "stats"; items: { id: string; value: string; label: string }[] };

export type BlockType = CaseStudyBlock["type"];

export type Project = {
  slug: string;
  name: string;
  type: ProjectType;
  timeline: string;
  coverImage: string;
  coverAlt: string;
  pdfUrl: string | null;
  liveUrl: string | null;
  summary: string;
  featured: boolean;
  order: number;
  blocks: CaseStudyBlock[];
};

export type ProjectInput = {
  slug: string;
  name: string;
  type: ProjectType;
  timeline: string;
  summary: string;
  coverImage: string;
  coverPublicId: string;
  coverAlt: string;
  pdfUrl: string | null;
  pdfPublicId: string | null;
  liveUrl: string | null;
  featured: boolean;
  published: boolean;
  order: number;
};

export type AdminProject = ProjectInput & { updatedAt: string | null; blocks: CaseStudyBlock[] };

// About Section
export type Experience = {
  id: string;
  period: string;
  role: string;
  company: string;
  type: string;
  description: string;
};

export type AboutContent = {
  photoUrl: string;
  photoPublicId: string;
  photoAlt: string;
  lead: string;
  paragraphs: string[];
  values: string[];
  experience: Experience[];
};

// Hero Section
export type StackGroup = {
  label: string;
  items: string[];
};

export type HeroContent = {
  eyebrow: string;
  designWord: string;
  devWord: string;
  frameLabel: string;
  headingAlt: string;
  summary: string;
  location: string;
  availability: string;
  stack: StackGroup[];
};

// Contact
export type SocialLink = {
  id: string;
  label: string;
  href: string;
};

export type ContactContent = {
  availability: string;
  message: string;
  email: string;
  socials: SocialLink[];
};
