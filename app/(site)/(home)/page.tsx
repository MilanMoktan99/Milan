import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { getFeaturedProjects } from "@/lib/projects";
import { NAV_ITEMS } from "@/lib/nav";
import { About } from "@/components/sections/About";

export const revalidate = 3600;

export default async function HomePage() {
  const projects = await getFeaturedProjects();

  return (
    <>
      <Hero />
      <Work projects={projects} />
      <About />

      {NAV_ITEMS.filter((item) => !["intro", "work"].includes(item.id)).map(
        ({ id, label }) => (
          <section
            key={id}
            id={id}
            className="site-grid min-h-screen items-center border-b border-border"
          >
            <h2 className="col-span-full text-6xl font-medium lg:col-span-8 lg:col-start-5">
              {label}
            </h2>
          </section>
        )
      )}
    </>
  );
}