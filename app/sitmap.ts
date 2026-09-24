import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";

const SITE_URL = "https://milanmoktan99.com.np";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects().catch(() => []);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
