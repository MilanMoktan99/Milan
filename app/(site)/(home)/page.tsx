import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Contact } from "@/components/sections/Contact";
import { getFeaturedProjects } from "@/lib/projects";
import { getAbout } from "@/lib/about";
import { getHero } from "@/lib/hero";
import { getContact } from "@/lib/contact";

export const revalidate = 3600;

export default async function HomePage() {
  const [projects, about, hero, contact] = await Promise.all([
    getFeaturedProjects(),
    getAbout(),
    getHero(),
    getContact(),
  ]);

  return (
    <>
      <Hero hero={hero} />
      <Work projects={projects} />
      <About about={about} />
      <Services />
      <Contact contact={contact} />
    </>
  );
}
