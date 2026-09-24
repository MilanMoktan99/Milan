export type ProjectType = "design" | "development";

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

export type AdminProject = ProjectInput & { updatedAt: string | null };

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
