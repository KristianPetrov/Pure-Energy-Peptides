import type { OrderStatus } from "@/db/schema";

const STATUS_STYLES: Record<OrderStatus, { label: string; className: string }> =
  {
    pending_payment: {
      label: "Awaiting payment",
      className: "bg-flame-soft text-flame-deep border-flame/25",
    },
    paid: {
      label: "Paid",
      className: "bg-aqua-soft text-aqua-deep border-aqua/25",
    },
    shipped: {
      label: "Shipped",
      className: "bg-aqua-soft text-aqua-deep border-aqua/40",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-silver-bright text-faint border-silver",
    },
  };

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${style.className}`}
    >
      {style.label}
    </span>
  );
}
