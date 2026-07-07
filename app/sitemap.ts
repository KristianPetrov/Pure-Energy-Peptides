import type { MetadataRoute } from "next";
import { getActiveProductSlugs } from "@/lib/data";
import { getSiteUrl } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes = (
    [
      { path: "/", changeFrequency: "weekly", priority: 1 },
      { path: "/store", changeFrequency: "daily", priority: 0.9 },
      { path: "/science", changeFrequency: "monthly", priority: 0.7 },
      { path: "/compliance", changeFrequency: "monthly", priority: 0.6 },
      { path: "/track", changeFrequency: "monthly", priority: 0.5 },
      { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
      { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    ] as const
  ).map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    changeFrequency,
    priority,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getActiveProductSlugs();
    productRoutes = products.map((product) => ({
      url: `${siteUrl}/store/${product.slug}`,
      lastModified: product.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // Database unavailable; publish the static routes only.
  }

  return [...staticRoutes, ...productRoutes];
}
