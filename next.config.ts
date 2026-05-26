import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/appwrite/:path*",
        destination: "https://cloud.appwrite.io/v1/:path*",
      },
      {
        source: "/api/appwrite-func",
        destination: process.env.APPWRITEAPIKEY,
      },
    ];
  },
};

export default nextConfig;
