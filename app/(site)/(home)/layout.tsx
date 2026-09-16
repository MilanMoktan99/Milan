import { Loader } from "@/components/layout/Loader";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Loader />
      <Sidebar />
      <MobileNav />
      <main className="pt-16 lg:pt-0">{children}</main>
    </>
  );
}