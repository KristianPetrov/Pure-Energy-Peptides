import Link from "next/link";
import { cacheLife } from "next/cache";
import { BRAND_NAME, RUO_NOTICE } from "@/lib/constants";
import { LogoMark, LogoWordmark } from "./logo";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="iridescent-dark">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 text-base">
              <LogoMark size={30} />
              <LogoWordmark />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
              {BRAND_NAME} supplies reference-grade research peptides with
              verified purity, precise documentation, and dependable
              fulfillment for qualified laboratories and researchers.
            </p>
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-flame">
                Research Use Only
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                {RUO_NOTICE}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Catalog
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/store" className="text-white/60 transition-colors hover:text-aqua">
                  All products
                </Link>
              </li>
              <li>
                <Link href="/science" className="text-white/60 transition-colors hover:text-aqua">
                  Quality &amp; science
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-white/60 transition-colors hover:text-aqua">
                  Track your order
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-white/60 transition-colors hover:text-aqua">
                  Your account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/compliance" className="text-white/60 transition-colors hover:text-aqua">
                  Research Use Only policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/60 transition-colors hover:text-aqua">
                  Terms of sale
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/60 transition-colors hover:text-aqua">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/40 sm:flex-row">
            <p>
              © <CopyrightYear /> {BRAND_NAME}. All rights reserved.
            </p>
            <p>
              By ordering you acknowledge you are a qualified researcher
              purchasing for laboratory research use only.
            </p>
          </div>
          <p className="pb-4 text-center text-[11px] text-white/25">
            Website designed by{" "}
            <a
              href="https://setfreedigitaldisciples.com"
              target="_blank"
              rel="noopener"
              className="transition-colors hover:text-white/50"
            >
              Set Free Digital Disciples
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
