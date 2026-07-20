export const BRAND_NAME = "Pure Energy Peptides";
export const ORDER_PREFIX = "PEP";
export const CART_STORAGE_KEY = "pep-cart-v1";

export const RUO_NOTICE =
  "For Research Use Only. Not for human or veterinary use. Products are intended strictly for in-vitro laboratory research and development.";

export const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard shipping", priceCents: 1500 },
  { id: "overnight", label: "Overnight shipping", priceCents: 5000 },
] as const;

export type ShippingMethodId = (typeof SHIPPING_OPTIONS)[number]["id"];

export function getShippingOption(id: string) {
  return SHIPPING_OPTIONS.find((option) => option.id === id) ?? null;
}

export const SITE_DOMAIN = "pureenergypeptides.com";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  const isLocalAddress = configured
    ? /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::|\/|$)/i.test(configured)
    : false;

  // Never emit a localhost canonical URL into a production build. Local
  // development can still serve on any port while metadata targets the site.
  return configured && !isLocalAddress
    ? configured
    : `https://${SITE_DOMAIN}`;
}

export const SITE_TAGLINE = "Reference-Grade Research Peptides";
export const SITE_DESCRIPTION = `${BRAND_NAME} supplies reference-grade research peptides with 99% verified purity — HPLC and third-party tested, lot-traceable, and shipped with care to qualified laboratories. For Research Use Only.`;

export const ZELLE_RECIPIENT =
  process.env.NEXT_PUBLIC_ZELLE_RECIPIENT ?? "payments@example.com";
export const VENMO_HANDLE =
  process.env.NEXT_PUBLIC_VENMO_HANDLE ?? "PureEnergyPeptides";

export function venmoPaymentLink(totalCents: number, reference: string) {
  const params = new URLSearchParams({
    txn: "pay",
    audience: "private",
    recipients: VENMO_HANDLE.replace(/^@/, ""),
    amount: (totalCents / 100).toFixed(2),
    note: reference,
  });
  return `https://venmo.com/?${params.toString()}`;
}
