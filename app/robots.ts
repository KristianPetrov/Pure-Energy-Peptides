import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/checkout",
          "/account",
          "/order/",
          "/verify-email",
          "/reset-password",
          "/mockup-compare",
        ],
      },
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl(),
  };
}
