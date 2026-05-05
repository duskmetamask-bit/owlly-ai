import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: "." },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
