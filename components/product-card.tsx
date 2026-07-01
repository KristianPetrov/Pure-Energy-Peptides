import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/db/schema";
import { formatMoney } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.inventory <= 0;

  return (
    <Link
      href={`/store/${product.slug}`}
      className="card-lift group flex flex-col overflow-hidden rounded-2xl border border-silver bg-white"
    >
      <div className="iridescent relative flex aspect-square items-center justify-center p-8">
        <Image
          src={product.image}
          alt={product.name}
          width={220}
          height={250}
          className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:-rotate-1"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-flame to-flame-deep px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Featured
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-aqua-deep">
          {product.category}
        </p>
        <h3 className="font-semibold text-ink transition-colors group-hover:text-aqua-deep">
          {product.name}
        </h3>
        <p className="text-sm text-faint">{product.shortDescription}</p>
        <p className="mt-auto pt-3 text-lg font-bold text-ink">
          {formatMoney(product.priceCents)}
        </p>
      </div>
    </Link>
  );
}
