import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
  },
  serverExternalPackages: ["firebase-admin", "cloudinary"],
};

export default nextConfig;
