import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Contact } from "@/components/sections/Contact";
import { getFeaturedProjects } from "@/lib/projects";

export const revalidate = 3600;

export default async function HomePage() {
  const projects = await getFeaturedProjects();

  return (
    <>
      <Hero />
      <Work projects={projects} />
      <About />
      <Services />
      <Contact />
    </>
  );
}