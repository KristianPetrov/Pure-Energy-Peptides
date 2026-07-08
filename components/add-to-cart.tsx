"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "./cart-provider";

type ProductInput = {
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  inventory: number;
};

export function AddToCart({ product }: { product: ProductInput }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const outOfStock = product.inventory <= 0;
  const max = Math.max(product.inventory, 0);

  const clamp = (value: number) => Math.min(Math.max(value, 1), max || 1);

  const add = () => {
    addItem(
      {
        slug: product.slug,
        name: product.name,
        image: product.image,
        priceCents: product.priceCents,
      },
      quantity
    );
  };

  const buyNow = () => {
    add();
    router.push("/checkout");
  };

  if (outOfStock) {
    return (
      <div className="rounded-2xl border border-silver bg-frost p-5 text-center text-sm font-medium text-faint">
        This compound is currently out of stock.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-ui">Quantity</span>
        <div className="flex items-center gap-1 rounded-full border border-silver p-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => clamp(q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-ui transition-colors hover:bg-silver-bright"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-8 text-center font-semibold text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => clamp(q + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-ui transition-colors hover:bg-silver-bright"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-xs text-faint">{product.inventory} in stock</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={add}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-aqua bg-card px-6 py-3.5 text-sm font-semibold text-aqua-deep transition-all hover:bg-aqua-soft hover:scale-[1.02]"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={2} />
          Add to cart
        </button>
        <button
          type="button"
          onClick={buyNow}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-flame to-flame-deep px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-flame/25 transition-all hover:scale-[1.02]"
        >
          <Zap className="h-4 w-4" strokeWidth={2} />
          Buy now
        </button>
      </div>
    </div>
  );
}
