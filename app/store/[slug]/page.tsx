import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getActiveProductVariantsByName,
  getProductBySlug,
} from "@/lib/data";
import { BRAND_NAME, getSiteUrl } from "@/lib/constants";
import { groupProductVariants } from "@/lib/product-variants";
import { JsonLd } from "@/components/json-ld";
import { ProductPurchase } from "@/components/product-purchase";
import { Reveal } from "@/components/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Product not found" };
    const description = `${product.shortDescription}. For Research Use Only.`;
    return {
      title: product.name,
      description,
      alternates: { canonical: `/store/${product.slug}` },
      openGraph: {
        title: product.name,
        description,
        url: `/store/${product.slug}`,
      },
    };
  } catch {
    return { title: "Store" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product || !product.active) notFound();
  const variants = await getActiveProductVariantsByName(product.name)
    .then((items) => groupProductVariants(items)[0]?.variants ?? [product])
    .catch(() => [product]);

  const siteUrl = getSiteUrl();
  const productUrl = `${siteUrl}/store/${product.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.name,
        description: product.shortDescription,
        image: `${siteUrl}${product.image}`,
        url: productUrl,
        sku: product.slug,
        category: product.category,
        brand: { "@id": `${siteUrl}/#organization` },
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "USD",
          price: (product.priceCents / 100).toFixed(2),
          availability:
            product.inventory > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: { "@id": `${siteUrl}/#organization` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: BRAND_NAME,
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Store",
            item: `${siteUrl}/store`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: productUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <JsonLd data={structuredData} />
      <Reveal>
        <Link
          href="/store"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-ui transition-colors hover:text-aqua-deep"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to catalog
        </Link>
      </Reveal>

      <ProductPurchase initialSlug={product.slug} variants={variants} />
    </div>
  );
}
