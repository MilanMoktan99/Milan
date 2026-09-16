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