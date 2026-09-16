type LoaderProps = { src: string; width: number; quality?: number };

export default function cloudinaryLoader({ src, width, quality }: LoaderProps) {
  // Leave non-Cloudinary images (like files in /public) untouched
  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }

  const params = ["f_auto", `q_${quality ?? "auto"}`, "c_limit", `w_${width}`];
  return src.replace("/upload/", `/upload/${params.join(",")}/`);
}