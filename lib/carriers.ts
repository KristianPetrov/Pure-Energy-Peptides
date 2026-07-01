const CARRIER_URLS: Record<string, (tracking: string) => string> = {
  usps: (t) =>
    `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(t)}`,
  ups: (t) => `https://www.ups.com/track?tracknum=${encodeURIComponent(t)}`,
  fedex: (t) =>
    `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(t)}`,
  dhl: (t) =>
    `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encodeURIComponent(t)}`,
};

export const CARRIERS = ["USPS", "UPS", "FedEx", "DHL"] as const;

export function trackingUrl(carrier: string | null, tracking: string | null) {
  if (!carrier || !tracking) return null;
  const builder = CARRIER_URLS[carrier.toLowerCase()];
  return builder ? builder(tracking) : null;
}
