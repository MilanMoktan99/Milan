import { Hero } from "@/components/sections/Hero";
import { NAV_ITEMS } from "@/lib/nav";

export default function HomePage() {
  return (
    <>
      <Hero />
      
      {NAV_ITEMS.map(({ id, label }) => (
        <section
          key={id}
          id={id}
          className="site-grid min-h-screen items-center border-b border-border"
        >
          <h2 className="col-span-full text-6xl font-medium lg:col-span-8 lg:col-start-5">
            {label}
          </h2>
        </section>
      ))}
    </>
  );
}
