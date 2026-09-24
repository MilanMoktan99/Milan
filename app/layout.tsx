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

const SITE_URL = "https://milanmoktan99.com.np";
const DESCRIPTION =
  "Milan Moktan is a UI/UX designer and web developer based in Kathmandu, Nepal, designing in Figma and building with Next.js and React.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Milan Moktan — UI/UX Designer & Web Developer",
    template: "%s — Milan Moktan",
  },
  description: DESCRIPTION,
  keywords: [
    "Milan Moktan",
    "UI/UX designer Nepal",
    "web developer Kathmandu",
    "Figma designer",
    "Next.js developer",
  ],
  authors: [{ name: "Milan Moktan", url: SITE_URL }],
  creator: "Milan Moktan",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Milan Moktan",
    title: "Milan Moktan — UI/UX Designer & Web Developer",
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Milan Moktan — UI/UX Designer & Web Developer",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Milan Moktan",
  url: SITE_URL,
  jobTitle: "UI/UX Designer & Web Developer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kathmandu",
    addressCountry: "NP",
  },
  knowsAbout: ["UI/UX Design", "Web Development", "Figma", "Next.js", "React"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
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
