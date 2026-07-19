"use client";

import { ShoppingBag } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useCart } from "./cart-provider";

export function CartButton() {
  const { count, subtotalCents, hydrated, isOpen, openCart } = useCart();
  const itemLabel = count === 1 ? "1 item" : `${count} items`;

  return (
    <button
      type="button"
      onClick={openCart}
      className="fixed bottom-4 right-4 z-40 flex min-h-14 items-center gap-3 rounded-full border border-white/15 bg-shell px-3.5 py-2.5 text-white shadow-[0_16px_45px_rgba(10,16,28,0.3)] transition-all hover:-translate-y-0.5 hover:border-aqua hover:shadow-[0_18px_50px_rgba(0,199,199,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua sm:bottom-6 sm:right-6 sm:px-4"
      aria-label={hydrated && count > 0 ? `Open cart, ${itemLabel}` : "Open cart"}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-aqua">
        <ShoppingBag className="h-4.5 w-4.5" strokeWidth={1.9} />
        {hydrated && count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-flame px-1 text-[10px] font-bold leading-none text-white animate-fade-in">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="hidden min-w-20 text-left sm:block">
        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
          Your cart
        </span>
        <span className="mt-0.5 block text-xs font-semibold text-white">
          {hydrated && count > 0
            ? `${itemLabel} · ${formatMoney(subtotalCents)}`
            : "Ready when you are"}
        </span>
      </span>
    </button>
  );
}
