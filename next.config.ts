import path from 'path';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Optimización de imágenes — permitir dominios externos si los hubiera
  images: {
    remotePatterns: [],
  },
  // Headers de cache equivalentes al vercel.json anterior
  async headers() {
    return [
      {
        source: "/assets/images/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/assets/audios/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/assets/favicons/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/data/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=300" }],
      },
    ];
  },
};

export default nextConfig;
