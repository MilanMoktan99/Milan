import type { Metadata } from "next";
import { Hanken_Grotesk, Allura } from "next/font/google";
import { THEME_IDS, themeCSS } from "@/lib/theme";
import "./globals.css";

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-brand-sans",
  display: "swap",
});

const script = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-allura",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://milanmoktan99.com.np"),
  title: "Milan Moktan — UI/UX Designer & Web Developer",
  description: "Portfolio of Milan Moktan, a UI/UX designer and web developer.",
};

const preferenceScript = `(function(){try{var d=document.documentElement,ids=${JSON.stringify(
  THEME_IDS,
)},t=localStorage.getItem('theme');if(ids.indexOf(t)<0)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.dataset.theme=t;d.dataset.grid=localStorage.getItem('grid')==='on'?'on':'off'}catch(e){}})()`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${script.variable}`}
      suppressHydrationWarning
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
        <noscript
          dangerouslySetInnerHTML={{
            __html: "<style>#site-loader{display:none}</style>",
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
