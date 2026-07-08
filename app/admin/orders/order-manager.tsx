"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  cancelOrder,
  markOrderPaid,
  markOrderShipped,
} from "@/app/actions/admin";
import { CARRIERS } from "@/lib/carriers";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { OrderItem, OrderStatus, ShippingAddress } from "@/db/schema";
import { OrderStatusBadge } from "@/components/order-status-badge";

type SerializedOrder = {
  id: string;
  reference: string;
  email: string;
  status: OrderStatus;
  paymentMethod: "zelle" | "venmo";
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  referralCode: string | null;
  totalCents: number;
  shippingAddress: ShippingAddress;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export function OrderManager({ orders }: { orders: SerializedOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-silver bg-frost p-10 text-center text-sm text-slate-ui">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderRow({ order }: { order: SerializedOrder }) {
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [carrier, setCarrier] = useState<string>(CARRIERS[0]);
  const [tracking, setTracking] = useState("");
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      setConfirmCancel(false);
    });
  };

  const address = order.shippingAddress;

  return (
    <div className="overflow-hidden rounded-2xl border border-silver bg-card transition-shadow hover:shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="font-mono text-sm font-bold text-foreground">
            {order.reference}
          </span>
          <span className="truncate text-sm text-slate-ui">
            {address.fullName}
          </span>
          <span className="text-xs text-faint">
            {formatDateTime(order.createdAt)}
          </span>
          <span className="rounded-full bg-silver-bright px-2 py-0.5 text-[11px] font-medium capitalize text-slate-ui">
            {order.paymentMethod}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <span className="text-sm font-bold text-foreground">
            {formatMoney(order.totalCents)}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-faint transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-silver bg-frost px-5 py-5 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-faint">
                Items
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="text-slate-ui">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatMoney(item.unitPriceCents * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 space-y-1 border-t border-silver pt-3 text-xs text-slate-ui">
                <p>Subtotal: {formatMoney(order.subtotalCents)}</p>
                {order.discountCents > 0 && (
                  <p>
                    Discount: -{formatMoney(order.discountCents)}
                    {order.referralCode ? ` (${order.referralCode})` : ""}
                  </p>
                )}
                <p>Shipping: {formatMoney(order.shippingCents)}</p>
                <p className="font-bold text-foreground">
                  Total: {formatMoney(order.totalCents)}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-faint">
                Customer
              </h3>
              <div className="mt-2 text-sm leading-relaxed text-slate-ui">
                <p className="font-medium text-foreground">{address.fullName}</p>
                <p>{order.email}</p>
                {address.phone && <p>{address.phone}</p>}
                <p className="mt-2">
                  {address.address1}
                  {address.address2 ? `, ${address.address2}` : ""}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                  <br />
                  {address.country}
                </p>
                <p className="mt-2 text-xs text-faint">
                  {address.shippingMethod === "overnight"
                    ? "Overnight shipping"
                    : "Standard shipping"}
                </p>
              </div>
            </div>
          </div>

          {order.status === "shipped" && (
            <p className="mt-5 rounded-xl bg-aqua-soft px-4 py-3 text-sm text-aqua-deep">
              Shipped via {order.carrier} — {order.trackingNumber}
            </p>
          )}

          {(order.status === "pending_payment" || order.status === "paid") && (
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-silver pt-5">
              {order.status === "pending_payment" && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => markOrderPaid(order.id))}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-aqua-deep to-aqua px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
                >
                  {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Mark paid
                </button>
              )}

              {order.status === "paid" && (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={carrier}
                    onChange={(event) => setCarrier(event.target.value)}
                    className="rounded-xl border border-silver bg-card px-3 py-2.5 text-sm outline-none focus:border-aqua"
                  >
                    {CARRIERS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    value={tracking}
                    onChange={(event) => setTracking(event.target.value)}
                    placeholder="Tracking number"
                    className="rounded-xl border border-silver bg-card px-3 py-2.5 text-sm outline-none focus:border-aqua"
                  />
                  <button
                    type="button"
                    disabled={pending || tracking.trim().length < 4}
                    onClick={() =>
                      run(() =>
                        markOrderShipped({
                          orderId: order.id,
                          carrier,
                          trackingNumber: tracking.trim(),
                        })
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-flame to-flame-deep px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-50"
                  >
                    {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Mark shipped
                  </button>
                </div>
              )}

              <div className="ml-auto">
                {confirmCancel ? (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span className="text-slate-ui">Cancel and restock?</span>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => cancelOrder(order.id))}
                      className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-canvas disabled:opacity-60"
                    >
                      Yes, cancel order
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(false)}
                      className="rounded-full border border-silver px-4 py-2 text-xs font-semibold text-slate-ui"
                    >
                      Keep it
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="rounded-full border border-silver px-4 py-2 text-sm font-medium text-faint transition-colors hover:border-flame hover:text-flame"
                  >
                    Cancel order
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-flame-soft px-4 py-3 text-sm text-flame-deep">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
