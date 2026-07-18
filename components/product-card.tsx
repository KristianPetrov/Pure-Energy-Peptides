"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductVariant } from "@/lib/product-variants";
import {
  formatProductVariantName,
  getProductBlurb,
  getProductDosage,
} from "@/lib/product-variants";
import { formatMoney } from "@/lib/format";
import { WireConnect } from "@/components/wire-connect";

export function ProductCard ({ variants }: { variants: ProductVariant[] })
{
  const [selected, setSelected] = useState(
    () => variants.find((variant) => variant.featured) ?? variants[0]
  );
  const featured = variants.some((variant) => variant.featured);
  const outOfStock = selected.inventory <= 0;
  const dosage = getProductDosage(selected);

  return (
    <div className="card-lift group relative flex h-full flex-col overflow-hidden rounded-xl border border-silver bg-card sm:rounded-2xl">
      <Link
        href={`/store/${selected.slug}`}
        aria-label={formatProductVariantName(selected)}
        className="absolute inset-0 z-[1]"
      />

      <div className="iridescent relative flex aspect-square items-center justify-center">
        <Image
          key={selected.slug}
          src={selected.image}
          alt={formatProductVariantName(selected)}
          width={220}
          height={250}
          className="h-full w-full object-contain animate-fade-in transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:-rotate-1"
        />
        <WireConnect className="pointer-events-none absolute inset-x-0 bottom-1 h-8 w-full sm:bottom-2 sm:h-12" />

        {featured && (
          <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-flame to-flame-deep px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
            Featured
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-2 top-2 rounded-full bg-shell/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-5">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-aqua-deep sm:text-[11px]">
          {selected.category}
        </p>
        <h3 className="text-sm font-semibold leading-tight text-ink transition-colors group-hover:text-aqua-deep sm:text-base">
          {selected.name}
        </h3>
        <p className="line-clamp-2 text-[11px] leading-snug text-faint sm:text-sm">
          {getProductBlurb(selected)}
        </p>

        <div className="mt-auto pt-2 sm:pt-3">
          {variants.length > 1 ? (
            <div
              role="group"
              aria-label={`${selected.name} dosage options`}
              className="relative z-[2] flex flex-wrap gap-1 sm:gap-1.5"
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
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all sm:px-2.5 sm:py-1 sm:text-xs ${
                      active
                        ? "border-aqua bg-aqua text-shell shadow-sm"
                        : "border-silver bg-card text-slate-ui hover:border-aqua hover:text-aqua-deep"
                    } ${variantOut && !active ? "opacity-50" : ""}`}
                  >
                    {getProductDosage(variant)}
                  </button>
                );
              })}
            </div>
          ) : (
            dosage && (
              <span className="inline-flex rounded-full border border-silver bg-frost px-2 py-0.5 text-[10px] font-bold text-slate-ui sm:px-2.5 sm:py-1 sm:text-xs">
                {dosage}
              </span>
            )
          )}

          <p className="pt-2 text-base font-bold text-ink sm:pt-3 sm:text-lg">
            {formatMoney(selected.priceCents)}
          </p>
        </div>
      </div>
    </div>
  );
}
