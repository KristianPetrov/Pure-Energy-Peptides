"use client";

import { useState, type ReactNode } from "react";
import { LayoutGrid, LayoutList } from "lucide-react";

export function MobileCatalogLayout({ children }: { children: ReactNode }) {
  const [columns, setColumns] = useState<1 | 2>(2);

  return (
    <div
      className="mobile-catalog-layout"
      data-mobile-columns={columns}
    >
      <div className="mt-8 flex items-center justify-end gap-2 sm:hidden">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
          View
        </span>
        <div
          role="group"
          aria-label="Products per row"
          className="flex rounded-full border border-silver bg-frost p-1 shadow-sm"
        >
          <button
            type="button"
            onClick={() => setColumns(1)}
            aria-label="Show one product per row"
            aria-pressed={columns === 1}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua ${
              columns === 1
                ? "bg-card text-aqua-deep shadow-sm"
                : "text-faint hover:text-aqua-deep"
            }`}
          >
            <LayoutList className="h-4 w-4" strokeWidth={1.9} />
          </button>
          <button
            type="button"
            onClick={() => setColumns(2)}
            aria-label="Show two products per row"
            aria-pressed={columns === 2}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua ${
              columns === 2
                ? "bg-card text-aqua-deep shadow-sm"
                : "text-faint hover:text-aqua-deep"
            }`}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={1.9} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
