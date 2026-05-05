import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@megaads/wm"],
  async rewrites() {
    return [
      {
        source: "/api/printerval/:path*",
        destination: "https://printerval.com/:path*",
      },
    ];
  },
};

export default nextConfig;
