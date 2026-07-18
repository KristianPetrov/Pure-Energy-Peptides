"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FlaskConical, ShieldAlert } from "lucide-react";
import type { ProductVariant } from "@/lib/product-variants";
import {
  formatProductVariantName,
  getProductDosage,
} from "@/lib/product-variants";
import { formatMoney } from "@/lib/format";
import { RUO_NOTICE } from "@/lib/constants";
import { AddToCart } from "@/components/add-to-cart";
import { Reveal } from "@/components/reveal";

export function ProductPurchase({
  initialSlug,
  variants,
}: {
  initialSlug: string;
  variants: ProductVariant[];
}) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const selected = useMemo(
    () => variants.find((variant) => variant.slug === selectedSlug) ?? variants[0],
    [selectedSlug, variants]
  );

  return (
    <div className="mt-8 grid gap-12 lg:grid-cols-2">
      <Reveal>
        <div className="iridescent relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-silver">
          <Image
            key={selected.image}
            src={selected.image}
            alt={formatProductVariantName(selected)}
            width={1024}
            height={1536}
            priority
            className="h-full w-full object-contain animate-float"
          />
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-aqua-deep">
              {selected.category}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {selected.name}
            </h1>
            <p className="mt-2 text-slate-ui">{selected.shortDescription}</p>
          </div>

          {variants.length > 1 && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-foreground">
                Select dosage
              </legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const active = variant.slug === selected.slug;
                  return (
                    <button
                      key={variant.slug}
                      type="button"
                      onClick={() => setSelectedSlug(variant.slug)}
                      aria-pressed={active}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                        active
                          ? "border-aqua bg-aqua text-shell shadow-sm"
                          : "border-silver bg-card text-slate-ui hover:border-aqua hover:text-aqua-deep"
                      }`}
                    >
                      {getProductDosage(variant)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <p className="text-3xl font-bold text-gradient-brand">
            {formatMoney(selected.priceCents)}
          </p>

          <AddToCart
            key={selected.slug}
            product={{
              slug: selected.slug,
              name: formatProductVariantName(selected),
              image: selected.image,
              priceCents: selected.priceCents,
              inventory: selected.inventory,
            }}
          />

          <div className="rounded-2xl border border-silver bg-frost p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FlaskConical className="h-4 w-4 text-aqua-deep" />
              Research overview
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-ui">
              {selected.description}
            </p>
          </div>

          <div className="flex gap-3 rounded-2xl border border-flame/25 bg-flame-soft p-5">
            <ShieldAlert className="h-5 w-5 shrink-0 text-flame" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Research Use Only
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-ui">
                {RUO_NOTICE}
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
