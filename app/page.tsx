import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import heroLogo from "@/public/brand/pe-clear.png";
import {
  ArrowRight,
  Atom,
  FlaskConical,
  Microscope,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Product } from "@/db/schema";
import { getFeaturedProducts } from "@/lib/data";
import { BRAND_NAME } from "@/lib/constants";
import { EnergyFlow } from "@/components/energy-flow";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const METRICS = [
  { value: "99%", label: "Purity — HPLC tested" },
  { value: "3rd", label: "Party tested, every lot" },
  { value: "22+", label: "Certified reference compounds" },
  { value: "48h", label: "Typical dispatch window" },
];

const VALUES = [
  {
    icon: FlaskConical,
    title: "Pure Quality",
    body: "Every lot is verified by independent HPLC and mass-spectrometry analysis before it reaches the catalog.",
    accent: "text-aqua-deep bg-aqua-soft",
  },
  {
    icon: Sparkles,
    title: "Powerful Energy",
    body: "Compounds selected for cellular-energy, metabolic, and mitochondrial research programs.",
    accent: "text-flame bg-flame-soft",
  },
  {
    icon: Microscope,
    title: "Holistic Wellness",
    body: "A curated range spanning repair, longevity, cognitive, and metabolic research pathways.",
    accent: "text-aqua-deep bg-aqua-soft",
  },
  {
    icon: ShieldCheck,
    title: "Optimal Vitality",
    body: "Lyophilized for stability, shipped cold-chain aware, and documented end to end.",
    accent: "text-flame bg-flame-soft",
  },
];

export default async function HomePage() {
  let featured: Product[] = [];
  try {
    featured = await getFeaturedProducts(6);
  } catch {
    // Database not configured yet; render the page without featured products.
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <EnergyFlow />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-white/35 to-white" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-20 text-center sm:pt-28">
          <Reveal>
            <div className="mx-auto mb-8 flex justify-center animate-float">
              <Image
                src={heroLogo}
                alt={`${BRAND_NAME} logo`}
                priority
                sizes="(max-width: 640px) 384px, 640px"
                className="w-96 max-w-full sm:w-160"
                style={{ height: "auto" }}
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-silver bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-ui backdrop-blur">
              <Atom className="h-3.5 w-3.5 text-aqua" />
              Balance · Energy · Vitality
            </p>
          </Reveal>
          <Reveal delay={200}>
            <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              <span className="text-gradient-brand">Powering</span> <span className="text-flame">Recovery</span>{" "}
              with research peptides of verified precision
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-ui sm:text-lg">
              {BRAND_NAME} supplies reference-grade compounds for qualified
              laboratories — 99% purity, HPLC and third-party tested,
              lot-traceable, and delivered with care. For Research Use Only.
            </p>
          </Reveal>
          <Reveal delay={400}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/store"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-flame to-flame-deep px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-flame/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-flame/30"
              >
                Browse the catalog
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/science"
                className="iridescent-border inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-ink transition-all hover:scale-[1.03]"
              >
                Our quality standards
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust metrics */}
      <section className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="iridescent grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-silver lg:grid-cols-4">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="bg-white/70 p-6 text-center backdrop-blur"
              >
                <p className="text-3xl font-bold text-gradient-brand">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-xs font-medium text-slate-ui">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 pt-24">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Where balance meets{" "}
              <span className="text-flame">energy</span>
            </h2>
            <p className="mt-4 text-slate-ui">
              Four principles guide everything we source, verify, and ship.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 100}>
              <div className="card-lift h-full rounded-2xl border border-silver bg-white p-6">
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${value.accent}`}
                >
                  <value.icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-ink">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-ui">
                  {value.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Featured compounds
                </h2>
                <p className="mt-3 text-slate-ui">
                  The most requested reference materials in our catalog.
                </p>
              </div>
              <Link
                href="/store"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-aqua-deep transition-colors hover:text-flame"
              >
                View all products
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => (
              <Reveal key={product.id} delay={(index % 3) * 100}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* RUO compliance CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-24">
        <Reveal>
          <div className="iridescent relative overflow-hidden rounded-3xl border border-silver p-10 sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-aqua/10 blur-3xl animate-pulse-soft" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-flame/10 blur-3xl animate-pulse-soft" />
            <div className="relative max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-flame">
                <PackageCheck className="h-4 w-4" />
                Research Use Only
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for qualified researchers
              </h2>
              <p className="mt-4 leading-relaxed text-slate-ui">
                Every product we supply is intended strictly for in-vitro
                laboratory research and development. Nothing in our catalog is
                for human or veterinary use, and every order requires a
                Research Use Only acknowledgement at checkout.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/compliance"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  Read our compliance policy
                </Link>
                <Link
                  href="/store"
                  className="inline-flex items-center gap-2 rounded-full border border-silver bg-white px-6 py-3 text-sm font-semibold text-ink transition-all hover:border-aqua hover:text-aqua-deep"
                >
                  Start researching
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
