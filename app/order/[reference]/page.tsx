import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  PackageCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { auth } from "@/auth";
import { getOrderByReference } from "@/lib/data";
import { formatDateTime, formatMoney } from "@/lib/format";
import {
  RUO_NOTICE,
  VENMO_HANDLE,
  ZELLE_RECIPIENT,
  venmoPaymentLink,
} from "@/lib/constants";
import { trackingUrl } from "@/lib/carriers";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Reveal } from "@/components/reveal";


export const metadata: Metadata = {
  title: "Order details",
  robots: { index: false },
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { reference } = await params;
  const { email } = await searchParams;

  const order = await getOrderByReference(reference).catch(() => null);
  if (!order) {
    redirect(`/track?reference=${encodeURIComponent(reference)}`);
  }

  const session = await auth();
  const isOwner = !!session?.user?.id && order.userId === session.user.id;
  const isAdmin = session?.user?.role === "admin";
  const guestMatch =
    !!email && email.toLowerCase() === order.email.toLowerCase();

  if (!isOwner && !isAdmin && !guestMatch) {
    redirect(`/track?reference=${encodeURIComponent(reference)}`);
  }

  const address = order.shippingAddress;
  const tracking = trackingUrl(order.carrier, order.trackingNumber);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm text-aqua-deep">
              <CheckCircle2 className="h-4 w-4" />
              Order placed {formatDateTime(order.createdAt)}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Order{" "}
              <span className="font-mono text-gradient-brand">
                {order.reference}
              </span>
            </h1>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </Reveal>

      {order.status === "pending_payment" && (
        <Reveal delay={100}>
          <div className="mt-8 rounded-2xl border-2 border-flame/30 bg-flame-soft p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <Wallet className="h-5 w-5 text-flame" />
              <h2 className="text-lg font-semibold text-ink">
                Complete your payment
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-ui">
              Send{" "}
              <strong className="text-ink">
                {formatMoney(order.totalCents)}
              </strong>{" "}
              using either option below, and include your order reference{" "}
              <strong className="font-mono text-ink">{order.reference}</strong>{" "}
              in the payment note. Your order ships after payment is verified.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-silver bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-faint">
                  Zelle
                </p>
                <p className="mt-2 flex items-center gap-2 break-all font-mono text-sm font-semibold text-ink">
                  {ZELLE_RECIPIENT}
                  <Copy className="h-3.5 w-3.5 shrink-0 text-faint" />
                </p>
              </div>
              <div className="rounded-xl border border-silver bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-faint">
                  Venmo
                </p>
                <p className="mt-2 font-mono text-sm font-semibold text-ink">
                  @{VENMO_HANDLE.replace(/^@/, "")}
                </p>
                <a
                  href={venmoPaymentLink(order.totalCents, order.reference)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-aqua-deep to-aqua px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  Pay {formatMoney(order.totalCents)} on Venmo
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {order.status === "shipped" && (
        <Reveal delay={100}>
          <div className="mt-8 rounded-2xl border-2 border-aqua/30 bg-aqua-soft p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <Truck className="h-5 w-5 text-aqua-deep" />
              <h2 className="text-lg font-semibold text-ink">
                Your order is on the way
              </h2>
            </div>
            <p className="mt-2 text-sm text-slate-ui">
              Shipped via <strong className="text-ink">{order.carrier}</strong>{" "}
              — tracking number{" "}
              <strong className="font-mono text-ink">
                {order.trackingNumber}
              </strong>
            </p>
            {tracking && (
              <a
                href={tracking}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-aqua-deep to-aqua px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Track your package
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </Reveal>
      )}

      {order.status === "paid" && (
        <Reveal delay={100}>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-aqua/30 bg-aqua-soft p-6">
            <PackageCheck className="h-5 w-5 shrink-0 text-aqua-deep" />
            <p className="text-sm text-slate-ui">
              Payment confirmed. Your order is being prepared for shipment —
              you&apos;ll receive tracking details by email once it ships.
            </p>
          </div>
        </Reveal>
      )}

      {order.status === "cancelled" && (
        <Reveal delay={100}>
          <div className="mt-8 rounded-2xl border border-silver bg-silver-bright p-6">
            <p className="text-sm text-slate-ui">
              This order was cancelled. If you believe this was in error,
              contact support.
            </p>
          </div>
        </Reveal>
      )}

      <Reveal delay={180}>
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="rounded-2xl border border-silver bg-white p-6">
            <h2 className="font-semibold text-ink">Items</h2>
            <ul className="mt-4 divide-y divide-silver">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <div className="iridescent flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-silver p-1">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-faint">
                      {formatMoney(item.unitPriceCents)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    {formatMoney(item.unitPriceCents * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-silver pt-4 text-sm">
              <div className="flex justify-between text-slate-ui">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotalCents)}</span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between text-aqua-deep">
                  <span>
                    Discount{order.referralCode ? ` (${order.referralCode})` : ""}
                  </span>
                  <span>-{formatMoney(order.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-ui">
                <span>Shipping</span>
                <span>{formatMoney(order.shippingCents)}</span>
              </div>
              <div className="flex justify-between border-t border-silver pt-3 text-base font-bold text-ink">
                <span>Total</span>
                <span>{formatMoney(order.totalCents)}</span>
              </div>
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-silver bg-frost p-6">
            <h2 className="font-semibold text-ink">Shipping to</h2>
            <address className="mt-3 text-sm not-italic leading-relaxed text-slate-ui">
              {address.fullName}
              <br />
              {address.address1}
              {address.address2 ? (
                <>
                  <br />
                  {address.address2}
                </>
              ) : null}
              <br />
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.country}
            </address>
            <p className="mt-4 text-xs text-faint">
              {address.shippingMethod === "overnight"
                ? "Overnight shipping"
                : "Standard shipping"}
              <br />
              Preferred payment:{" "}
              <span className="capitalize">{order.paymentMethod}</span>
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={240}>
        <p className="mt-10 rounded-xl border border-silver bg-frost p-4 text-center text-[11px] leading-relaxed text-faint">
          {RUO_NOTICE}
        </p>
        <p className="mt-6 text-center text-sm text-slate-ui">
          Questions about this order?{" "}
          <Link href="/track" className="font-semibold text-aqua-deep hover:text-flame">
            Track it anytime
          </Link>{" "}
          with your reference and email.
        </p>
      </Reveal>
    </div>
  );
}
