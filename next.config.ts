import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/appwrite/:path*",
        destination: "https://cloud.appwrite.io/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
