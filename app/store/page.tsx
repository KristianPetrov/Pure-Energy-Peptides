import type { Metadata } from "next";
import type { Product } from "@/db/schema";
import { getActiveProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { MobileCatalogLayout } from "@/components/mobile-catalog-layout";
import { groupProductVariants } from "@/lib/product-variants";


export const metadata: Metadata = {
  title: "Research Peptide Catalog",
  description:
    "Browse reference-grade research peptides verified by HPLC/MS — repair, longevity, cognitive, and metabolic research compounds. For Research Use Only.",
  alternates: { canonical: "/store" },
  openGraph: {
    title: "Research Peptide Catalog",
    description:
      "Browse reference-grade research peptides verified by HPLC/MS. For Research Use Only.",
    url: "/store",
  },
};

export default async function StorePage() {
  let products: Product[] = [];
  let dbError = false;
  try {
    products = await getActiveProducts();
  } catch {
    dbError = true;
  }

  const productGroups = groupProductVariants(products);
  const categories = [
    ...new Set(productGroups.map(({ product }) => product.category)),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Reveal>
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">
            Research <span className="text-gradient-brand">catalog</span>
          </h1>
          <p className="mt-4 text-slate-ui">
            Reference compounds verified by HPLC/MS and organized by research
            pathway. All products are for laboratory research use only.
          </p>
        </div>
      </Reveal>

      {dbError && (
        <div className="mt-12 rounded-2xl border border-silver bg-frost p-8 text-center text-sm text-slate-ui">
          The catalog is temporarily unavailable. Please check back shortly.
        </div>
      )}

      {!dbError && products.length === 0 && (
        <div className="mt-12 rounded-2xl border border-silver bg-frost p-8 text-center text-sm text-slate-ui">
          No products are currently available.
        </div>
      )}

      {categories.length > 0 && (
        <MobileCatalogLayout>
          {categories.map((category) => (
            <section key={category} className="mt-10 sm:mt-16">
              <Reveal>
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-foreground">{category}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-silver to-transparent" />
                </div>
              </Reveal>
              <div className="catalog-product-grid mt-7 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {productGroups
                  .filter(({ product }) => product.category === category)
                  .map(({ product, variants }, index) => (
                    <Reveal key={product.id} className="h-full" delay={(index % 3) * 80}>
                      <ProductCard variants={variants} />
                    </Reveal>
                  ))}
              </div>
            </section>
          ))}
        </MobileCatalogLayout>
      )}
    </div>
  );
}
