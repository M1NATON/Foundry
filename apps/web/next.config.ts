import type { NextConfig } from "next";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ??
  "http://localhost:4000";

const nextConfig: NextConfig = {
  transpilePackages: ["@foundry/shared-types"],
  // `next build` затирает каталог, из которого раздаёт чанки запущенный
  // `next dev`, и dev-сервер после этого падает на отсутствующих чанках.
  // NEXT_DIST_DIR даёт проверочной сборке собственный каталог. Учти, что
  // такая сборка переписывает ссылку в next-env.d.ts — её надо вернуть.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
