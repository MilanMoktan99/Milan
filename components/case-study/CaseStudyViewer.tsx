"use client";

import dynamic from "next/dynamic";
import { PdfSkeleton } from "./PdfSkeleton";

const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
  loading: () => <PdfSkeleton />,
});

export function CaseStudyViewer({ url, title }: { url: string; title: string }) {
  return <PdfViewer url={url} title={title} />;
}