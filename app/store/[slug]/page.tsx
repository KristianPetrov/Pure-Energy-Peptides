import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FlaskConical, ShieldAlert } from "lucide-react";
import { getProductBySlug } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { RUO_NOTICE } from "@/lib/constants";
import { AddToCart } from "@/components/add-to-cart";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Product not found" };
    return {
      title: product.name,
      description: `${product.shortDescription}. For Research Use Only.`,
    };
  } catch {
    return { title: "Store" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product || !product.active) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <Reveal>
        <Link
          href="/store"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-ui transition-colors hover:text-aqua-deep"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to catalog
        </Link>
      </Reveal>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="iridescent relative flex aspect-square items-center justify-center rounded-3xl border border-silver p-12">
            <Image
              src={product.image}
              alt={product.name}
              width={340}
              height={385}
              priority
              className="h-full w-full object-contain animate-float"
            />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-aqua-deep">
                {product.category}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-slate-ui">{product.shortDescription}</p>
            </div>

            <p className="text-3xl font-bold text-gradient-brand">
              {formatMoney(product.priceCents)}
            </p>

            <AddToCart
              product={{
                slug: product.slug,
                name: product.name,
                image: product.image,
                priceCents: product.priceCents,
                inventory: product.inventory,
              }}
            />

            <div className="rounded-2xl border border-silver bg-frost p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <FlaskConical className="h-4 w-4 text-aqua-deep" />
                Research overview
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-ui">
                {product.description}
              </p>
            </div>

            <div className="flex gap-3 rounded-2xl border border-flame/25 bg-flame-soft p-5">
              <ShieldAlert className="h-5 w-5 shrink-0 text-flame" />
              <div>
                <p className="text-sm font-semibold text-ink">
                  Research Use Only
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-ui">
                  {RUO_NOTICE}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
