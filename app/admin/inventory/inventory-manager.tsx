"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateProductFull } from "@/app/actions/admin";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  category: string;
  priceCents: number;
  inventory: number;
  active: boolean;
  featured: boolean;
};

export function InventoryManager({ products }: { products: ProductRow[] }) {
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <InventoryRow key={product.id} product={product} />
      ))}
    </div>
  );
}

function InventoryRow({ product }: { product: ProductRow }) {
  const [price, setPrice] = useState((product.priceCents / 100).toFixed(2));
  const [inventory, setInventory] = useState(String(product.inventory));
  const [active, setActive] = useState(product.active);
  const [featured, setFeatured] = useState(product.featured);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setError(null);
    setSaved(false);
    const priceCents = Math.round(parseFloat(price) * 100);
    const inventoryInt = parseInt(inventory, 10);
    if (Number.isNaN(priceCents) || priceCents < 0) {
      setError("Enter a valid price.");
      return;
    }
    if (Number.isNaN(inventoryInt) || inventoryInt < 0) {
      setError("Enter a valid inventory count.");
      return;
    }
    startTransition(async () => {
      const result = await updateProductFull({
        productId: product.id,
        priceCents,
        inventory: inventoryInt,
        active,
        featured,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(result.error ?? "Failed to save.");
      }
    });
  };

  const currentInventory = Number.parseInt(inventory, 10);
  const stockTone =
    Number.isNaN(currentInventory)
      ? "text-flame-deep"
      : currentInventory <= 0
      ? "text-flame-deep"
      : currentInventory <= 5
        ? "text-flame"
        : "text-aqua-deep";
  const stockLabel = Number.isNaN(currentInventory)
    ? "Enter a stock count"
    : currentInventory <= 0
      ? "Out of stock"
      : currentInventory <= 5
        ? `${currentInventory} left · Low stock`
        : `${currentInventory} in stock`;

  return (
    <article className="grid gap-5 rounded-2xl border border-silver bg-card p-4 shadow-sm sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em]">
          <span className="rounded-full bg-aqua-soft px-2.5 py-1 text-aqua-deep">
            {product.category}
          </span>
          <span className={`rounded-full bg-frost px-2.5 py-1 ${stockTone}`}>
            {stockLabel}
          </span>
        </div>
        <h2 className="break-words text-base font-semibold leading-snug text-foreground sm:text-lg">
          {product.name}
        </h2>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-faint sm:text-sm">
          {product.shortDescription}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[7.5rem_6.5rem_auto_auto_auto] sm:items-end lg:justify-end">
        <label className="block min-w-0 text-[11px] font-bold uppercase tracking-wider text-slate-ui">
          Price
          <span className="mt-1.5 flex min-h-11 items-center rounded-xl border border-silver bg-frost px-3 focus-within:border-aqua focus-within:ring-2 focus-within:ring-aqua/15">
            <span aria-hidden="true" className="mr-1 text-faint">$</span>
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="decimal"
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-foreground outline-none"
              aria-label={`Price for ${product.name}`}
            />
          </span>
        </label>

        <label className="block min-w-0 text-[11px] font-bold uppercase tracking-wider text-slate-ui">
          Quantity
          <input
            value={inventory}
            onChange={(event) => setInventory(event.target.value)}
            inputMode="numeric"
            className="mt-1.5 min-h-11 w-full rounded-xl border border-silver bg-frost px-3 text-base font-semibold text-foreground outline-none focus:border-aqua focus:ring-2 focus:ring-aqua/15"
            aria-label={`Inventory for ${product.name}`}
          />
        </label>

        <label
          className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 self-end rounded-xl border px-3 text-xs font-semibold transition-colors ${
            active
              ? "border-aqua/40 bg-aqua-soft text-aqua-deep"
              : "border-silver bg-frost text-faint"
          }`}
        >
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="h-4 w-4 accent-aqua"
          />
          Active
        </label>

        <label
          className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 self-end rounded-xl border px-3 text-xs font-semibold transition-colors ${
            featured
              ? "border-flame/40 bg-flame-soft text-flame-deep"
              : "border-silver bg-frost text-faint"
          }`}
        >
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
            className="h-4 w-4 accent-[#ff7a00]"
          />
          Featured
        </label>

        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 self-end rounded-xl bg-ink px-5 text-sm font-semibold text-canvas transition-[transform,opacity] hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60 sm:col-span-1"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4 text-aqua" />
          ) : null}
          {pending ? "Saving…" : saved ? "Saved" : "Save"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-flame-soft px-3 py-2 text-xs font-medium text-flame-deep lg:col-span-2" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
