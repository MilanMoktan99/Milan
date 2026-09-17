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
