import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/db/schema";
import { formatMoney } from "@/lib/format";
import { WireConnect } from "@/components/wire-connect";

export function ProductCard ({ product }: { product: Product })
{
  const outOfStock = product.inventory <= 0;

  return (
    <Link
      href={`/store/${product.slug}`}
      className="card-lift group flex h-full flex-col overflow-hidden rounded-xl border border-silver bg-card sm:rounded-2xl"
    >
      <div className="iridescent relative flex aspect-square items-center justify-center p-5 sm:p-12 lg:p-10">
        <Image
          src={product.image}
          alt={product.name}
          width={220}
          height={250}
          className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:-rotate-1"
        />
        <WireConnect className="pointer-events-none absolute inset-x-0 bottom-1 h-8 w-full sm:bottom-2 sm:h-12" />

        {product.featured && (
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
          {product.category}
        </p>
        <h3 className="text-sm font-semibold leading-tight text-ink transition-colors group-hover:text-aqua-deep sm:text-base">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-[11px] leading-snug text-faint sm:text-sm">
          {product.shortDescription}
        </p>
        <p className="mt-auto pt-2 text-base font-bold text-ink sm:pt-3 sm:text-lg">
          {formatMoney(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
