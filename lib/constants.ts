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

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

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
