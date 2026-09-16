import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { SiteControls } from "@/components/ui/SiteControls";
import { GridOverlay } from "@/components/ui/GridOverlay";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <SiteControls />
      <GridOverlay />
      {children}
    </SmoothScroll>
  );
}