import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.4.48", "localhost"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
