"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { count, hydrated, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-all hover:border-aqua hover:text-aqua"
      aria-label="Open cart"
    >
      <ShoppingBag className="h-4.5 w-4.5" strokeWidth={1.8} />
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-flame px-1 text-[11px] font-bold text-white animate-fade-in">
          {count}
        </span>
      )}
    </button>
  );
}
