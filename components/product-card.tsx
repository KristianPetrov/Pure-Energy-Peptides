"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { ProductVariant } from "@/lib/product-variants";
import {
  formatProductVariantName,
  getProductBlurb,
  getProductDosage,
} from "@/lib/product-variants";
import { formatMoney } from "@/lib/format";
import { WireConnect } from "@/components/wire-connect";
import { useCart } from "@/components/cart-provider";

export function ProductCard ({ variants }: { variants: ProductVariant[] })
{
  const { addItem } = useCart();
  const [selected, setSelected] = useState(
    () => variants.find((variant) => variant.featured) ?? variants[0]
  );
  const featured = variants.some((variant) => variant.featured);
  const outOfStock = selected.inventory <= 0;
  const dosage = getProductDosage(selected);

  const addSelectedToCart = () =>
  {
    if (outOfStock) return;

    addItem({
      slug: selected.slug,
      name: formatProductVariantName(selected),
      image: selected.image,
      priceCents: selected.priceCents,
    });
  };

  return (
    <div className="card-lift group relative flex h-full flex-col overflow-hidden rounded-xl border border-silver bg-card sm:rounded-2xl">
      <Link
        href={`/store/${selected.slug}`}
        aria-label={formatProductVariantName(selected)}
        className="absolute inset-0 z-[1]"
      />

      <div className="product-stage relative flex aspect-[4/5] items-center justify-center overflow-hidden sm:aspect-[3/2]">
        <div className="product-glow" aria-hidden />
        <WireConnect className="pointer-events-none absolute inset-0 z-0 h-full w-full" />
        <Image
          key={selected.slug}
          src={selected.image}
          alt={formatProductVariantName(selected)}
          width={320}
          height={400}
          className="relative z-[1] h-[92%] w-[92%] object-contain animate-fade-in drop-shadow-[0_18px_28px_rgba(19,28,43,0.18)] transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:-rotate-1 dark:drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)]"
        />
        {featured && (
          <span className="absolute left-2 top-2 z-[2] rounded-full bg-gradient-to-r from-flame to-flame-deep px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
            Featured
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-2 top-2 z-[2] rounded-full bg-shell/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
            Out of stock
          </span>
        )}
        {(variants.length > 1 || dosage) && (
          <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-card/90 via-card/55 to-transparent px-2 pb-2 pt-8 sm:px-3 sm:pb-3">
            {variants.length > 1 ? (
              <div
                role="group"
                aria-label={`${selected.name} dosage options`}
                className="relative flex flex-wrap justify-center gap-1 sm:gap-1.5"
              >
                {variants.map((variant) => {
                  const active = variant.slug === selected.slug;
                  const variantOut = variant.inventory <= 0;
                  return (
                    <button
                      key={variant.slug}
                      type="button"
                      onClick={() => setSelected(variant)}
                      aria-pressed={active}
                      title={variantOut ? "Out of stock" : undefined}
                      className={`rounded-full border px-2 py-0.5 text-[12px] font-extrabold shadow-sm backdrop-blur-sm transition-all sm:px-2.5 sm:py-1 sm:text-sm ${
                        active
                          ? "border-aqua bg-aqua text-shell"
                          : "border-silver/80 bg-card/90 text-slate-ui hover:border-aqua hover:text-aqua-deep"
                      } ${variantOut && !active ? "opacity-50" : ""}`}
                    >
                      {getProductDosage(variant)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center">
                <span className="rounded-full border border-silver/80 bg-card/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-ui shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-xs">
                  {dosage}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-5">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-aqua-deep sm:text-[11px]">
          {selected.category}
        </p>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight text-ink transition-colors group-hover:text-aqua-deep sm:text-base">
            {selected.name}
          </h3>
          <p className="shrink-0 text-sm font-bold leading-tight text-ink sm:text-base">
            {formatMoney(selected.priceCents)}
          </p>
        </div>
        <p className="line-clamp-2 text-[11px] leading-snug text-faint sm:text-sm">
          {getProductBlurb(selected)}
        </p>

        <div className="mt-auto pt-2 sm:pt-3">
          <button
            type="button"
            onClick={addSelectedToCart}
            disabled={outOfStock}
            className="relative z-[2] inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-aqua-deep to-aqua px-3 py-2 text-[11px] font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua disabled:cursor-not-allowed disabled:from-faint disabled:to-faint disabled:opacity-60 disabled:hover:scale-100 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
            aria-label={
              outOfStock
                ? `${formatProductVariantName(selected)} is out of stock`
                : `Add ${formatProductVariantName(selected)} to cart`
            }
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
