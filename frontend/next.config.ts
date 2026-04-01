import type { NextConfig } from "next";

const sealBackend =
  process.env.SEAL_API_PROXY_TARGET?.replace(/\/$/, "") ?? "http://127.0.0.1:3010";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${sealBackend}/api/:path*` },
      { source: "/health", destination: `${sealBackend}/health` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
