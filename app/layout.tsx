import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milan — UI/UX Designer & Web Developer",
  description: "Portfolio of Milan, a UI/UX designer and web developer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body className="antialiased">{children}</body>
    </html>
  );
}