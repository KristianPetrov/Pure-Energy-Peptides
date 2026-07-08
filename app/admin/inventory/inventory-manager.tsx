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

  const stockTone =
    product.inventory <= 0
      ? "text-flame-deep"
      : product.inventory <= 5
        ? "text-flame"
        : "text-faint";

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-silver bg-card px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">
          {product.name}{" "}
          <span className="text-xs text-faint">
            — {product.shortDescription}
          </span>
        </p>
        <p className={`text-xs ${stockTone}`}>
          {product.category} · {product.inventory} in stock
        </p>
      </div>

      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-ui">
        $
        <input
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          inputMode="decimal"
          className="w-20 rounded-lg border border-silver px-2.5 py-2 text-sm outline-none focus:border-aqua"
          aria-label={`Price for ${product.name}`}
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-ui">
        Qty
        <input
          value={inventory}
          onChange={(event) => setInventory(event.target.value)}
          inputMode="numeric"
          className="w-16 rounded-lg border border-silver px-2.5 py-2 text-sm outline-none focus:border-aqua"
          aria-label={`Inventory for ${product.name}`}
        />
      </label>
      <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-ui">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="accent-aqua"
        />
        Active
      </label>
      <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-ui">
        <input
          type="checkbox"
          checked={featured}
          onChange={(event) => setFeatured(event.target.checked)}
          className="accent-[#ff7a00]"
        />
        Featured
      </label>

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : saved ? (
          <Check className="h-3.5 w-3.5 text-aqua" />
        ) : null}
        {saved ? "Saved" : "Save"}
      </button>

      {error && <p className="w-full text-xs text-flame-deep">{error}</p>}
    </div>
  );
}
