import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  images: {
    // AVIF encoding currently flattens PNG alpha to opaque white via the
    // image optimizer; WebP keeps transparency for product mockups.
    formats: ["image/webp"],
  },
};

export default nextConfig;
