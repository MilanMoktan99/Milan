import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Loader } from "@/components/layout/Loader";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SiteControls } from "@/components/ui/SiteControls";
import { GridOverlay } from "@/components/ui/GridOverlay";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <Loader />
      <Sidebar />
      <MobileNav />
      <SiteControls />
      <GridOverlay />
      <main className="pt-16 lg:pt-0">{children}</main>
    </SmoothScroll>
  );
}