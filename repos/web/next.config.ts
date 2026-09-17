import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: "standalone",
  allowedDevOrigins: ["192.168.4.48", "192.168.4.188", "localhost"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
