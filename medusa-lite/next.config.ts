import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.actify.icu",
      },
      {
        protocol: "https",
        hostname: "up.actify.icu",
      },
      {
        protocol: "https",
        hostname: "img.siraacc.cn",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
