import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    const appwriteFunctionUrl = process.env.APPWRITE_FUNCTION_URL;
    return [
      {
        source: "/api/appwrite/:path*",
        destination: "https://cloud.appwrite.io/v1/:path*",
      },
      ...(appwriteFunctionUrl
        ? [
            {
              source: "/api/appwrite-func/:path*",
              destination: appwriteFunctionUrl,
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
