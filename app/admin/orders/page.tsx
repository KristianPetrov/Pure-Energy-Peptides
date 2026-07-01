import { getAllOrdersWithItems } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { StatCard } from "@/components/stat-card";
import { OrderManager } from "./order-manager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersWithItems();

  const pendingCount = orders.filter(
    (o) => o.status === "pending_payment"
  ).length;
  const paidCount = orders.filter((o) => o.status === "paid").length;
  const confirmedRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "shipped")
    .reduce((sum, o) => sum + o.totalCents, 0);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={String(orders.length)} />
        <StatCard label="Awaiting payment" value={String(pendingCount)} />
        <StatCard label="Ready to ship" value={String(paidCount)} />
        <StatCard
          label="Confirmed revenue"
          value={formatMoney(confirmedRevenue)}
          hint="Paid and shipped orders"
        />
      </div>
      <div className="mt-8">
        <OrderManager
          orders={orders.map((order) => ({
            ...order,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
