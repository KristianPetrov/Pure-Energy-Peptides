"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/referrals", label: "Referrals" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex gap-1 overflow-x-auto rounded-full border border-silver bg-frost p-1">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all ${
              active
                ? "bg-white text-ink shadow-sm"
                : "text-slate-ui hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
