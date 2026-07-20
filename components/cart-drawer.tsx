"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useCart } from "./cart-provider";

export function CartDrawer ()
{
  const { items, subtotalCents, isOpen, closeCart, setQuantity, removeItem } =
    useCart();

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-shell/25 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/60 ${isOpen ? "opacity-100" : "opacity-0"
          }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-silver bg-card shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-silver px-6 py-4">
          <h2 className="text-lg font-semibold text-ink">Your Cart</h2>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-silver text-slate-ui transition-colors hover:border-aqua hover:text-aqua-deep"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-faint">Your cart is empty.</p>
            <Link
              href="/store"
              onClick={closeCart}
              className="rounded-full bg-gradient-to-r from-aqua-deep to-aqua px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Browse the catalog
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-silver overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.slug} className="flex gap-4 py-4">
                  <div className="product-stage relative flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-silver p-1.5">
                    <div className="product-glow product-glow-sm" aria-hidden />
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      sizes="72px"
                      className="relative z-[1] h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-ink">
                        {item.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        className="text-faint transition-colors hover:text-flame"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-silver px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.slug, item.quantity - 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-ui transition-colors hover:bg-silver-bright"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-5 text-center text-sm font-medium text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.slug, item.quantity + 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-ui transition-colors hover:bg-silver-bright"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-ink">
                        {formatMoney(item.priceCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-silver px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-ui">Subtotal</span>
                <span className="text-lg font-bold text-ink">
                  {formatMoney(subtotalCents)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full rounded-full bg-gradient-to-r from-flame to-flame-deep py-3 text-center text-sm font-semibold text-white shadow-lg shadow-flame/20 transition-transform hover:scale-[1.02]"
              >
                Proceed to checkout
              </Link>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-faint">
                Shipping and discounts are calculated at checkout. For Research
                Use Only.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
