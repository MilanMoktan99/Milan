import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Milan Moktan",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-svh">{children}</div>;
}
