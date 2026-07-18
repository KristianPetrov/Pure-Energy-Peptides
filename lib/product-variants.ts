import type { Product } from "@/db/schema";

export type ProductVariant = Pick<
  Product,
  | "slug"
  | "name"
  | "shortDescription"
  | "description"
  | "category"
  | "priceCents"
  | "image"
  | "inventory"
  | "featured"
>;

export type ProductGroup = {
  product: Product;
  variants: Product[];
};

export function getProductDosage(product: ProductVariant) {
  return product.shortDescription.match(/^(.+?)\s+-\s+/)?.[1]?.trim() ?? "";
}

export function getProductBlurb(product: ProductVariant) {
  return product.shortDescription.replace(/^.+?\s+-\s+/, "");
}

export function formatProductVariantName(product: ProductVariant) {
  const dosage = getProductDosage(product);
  return dosage ? `${product.name} — ${dosage}` : product.name;
}

function dosageAmount(product: ProductVariant) {
  return Number.parseFloat(getProductDosage(product).replace(/[^\d.]/g, "")) || 0;
}

export function groupProductVariants(products: Product[]): ProductGroup[] {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const key = product.name.trim().toLocaleLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), product]);
  }

  return [...groups.values()].map((group) => {
    const variants = [...group].sort(
      (a, b) => dosageAmount(a) - dosageAmount(b)
    );
    const representative =
      variants.find((variant) => variant.featured) ?? variants[0];

    return {
      variants,
      product: {
        ...representative,
        priceCents: Math.min(...variants.map((variant) => variant.priceCents)),
        inventory: variants.reduce(
          (total, variant) => total + variant.inventory,
          0
        ),
      },
    };
  });
}
