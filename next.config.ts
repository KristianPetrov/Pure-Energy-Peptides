import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  images: {
    // AVIF encoding currently flattens PNG alpha to opaque white via the
    // image optimizer; WebP keeps transparency for product mockups.
    formats: ["image/webp"],
    qualities: [75],
    minimumCacheTTL: 86_400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1440],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
