"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY } from "@/lib/constants";

export type CartItem = {
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  quantity: number;
};

// External localStorage-backed store consumed via useSyncExternalStore.
// This avoids hydration mismatches and keeps the cart in sync across tabs.
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = EMPTY;

function readItems(): CartItem[] {
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    if (!raw) {
      cachedItems = EMPTY;
    } else {
      try {
        cachedItems = JSON.parse(raw) as CartItem[];
      } catch {
        cachedItems = EMPTY;
      }
    }
  }
  return cachedItems;
}

function writeItems(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  for (const listener of listeners) listener();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, readItems, () => EMPTY);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      const current = readItems();
      const existing = current.find((line) => line.slug === item.slug);
      const next = existing
        ? current.map((line) =>
            line.slug === item.slug
              ? { ...line, quantity: line.quantity + quantity }
              : line
          )
        : [...current, { ...item, quantity }];
      writeItems(next);
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((slug: string) => {
    writeItems(readItems().filter((line) => line.slug !== slug));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    const current = readItems();
    writeItems(
      quantity <= 0
        ? current.filter((line) => line.slug !== slug)
        : current.map((line) =>
            line.slug === slug ? { ...line, quantity } : line
          )
    );
  }, []);

  const clear = useCallback(() => writeItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, line) => sum + line.quantity, 0);
    const subtotalCents = items.reduce(
      (sum, line) => sum + line.priceCents * line.quantity,
      0
    );
    return {
      items,
      count,
      subtotalCents,
      hydrated,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      clear,
    };
  }, [
    items,
    hydrated,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    setQuantity,
    clear,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
