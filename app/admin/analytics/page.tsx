import Link from "next/link";
import { getAllOrdersWithItems } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { StatCard } from "@/components/stat-card";


const RANGES = [7, 30, 90] as const;

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = RANGES.includes(Number(rangeParam) as (typeof RANGES)[number])
    ? (Number(rangeParam) as (typeof RANGES)[number])
    : 30;

  const allOrders = await getAllOrdersWithItems();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (range - 1));

  const ordersInRange = allOrders.filter(
    (order) => new Date(order.createdAt) >= since
  );
  const confirmed = ordersInRange.filter(
    (order) => order.status === "paid" || order.status === "shipped"
  );

  const revenue = confirmed.reduce((sum, order) => sum + order.totalCents, 0);
  const unitsSold = confirmed.reduce(
    (sum, order) =>
      sum + order.items.reduce((s, item) => s + item.quantity, 0),
    0
  );
  const aov = confirmed.length > 0 ? Math.round(revenue / confirmed.length) : 0;

  // Daily revenue including empty days.
  const days: { label: string; cents: number }[] = [];
  for (let i = 0; i < range; i++) {
    const day = new Date(since);
    day.setDate(since.getDate() + i);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const cents = confirmed
      .filter((order) => {
        const created = new Date(order.createdAt);
        return created >= day && created < next;
      })
      .reduce((sum, order) => sum + order.totalCents, 0);
    days.push({
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      cents,
    });
  }
  const maxDay = Math.max(...days.map((d) => d.cents), 1);

  // Top products by revenue.
  const productTotals = new Map<string, { name: string; cents: number; units: number }>();
  for (const order of confirmed) {
    for (const item of order.items) {
      const entry = productTotals.get(item.slug) ?? {
        name: item.name,
        cents: 0,
        units: 0,
      };
      entry.cents += item.unitPriceCents * item.quantity;
      entry.units += item.quantity;
      productTotals.set(item.slug, entry);
    }
  }
  const topProducts = [...productTotals.values()]
    .sort((a, b) => b.cents - a.cents)
    .slice(0, 6);
  const maxProduct = Math.max(...topProducts.map((p) => p.cents), 1);

  // Status / payment / referral breakdowns.
  const statusCounts = new Map<string, number>();
  for (const order of ordersInRange) {
    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
  }
  const paymentCounts = new Map<string, number>();
  for (const order of confirmed) {
    paymentCounts.set(
      order.paymentMethod,
      (paymentCounts.get(order.paymentMethod) ?? 0) + 1
    );
  }
  const referredCount = confirmed.filter((order) => order.referralCodeId).length;
  const discountsGiven = confirmed.reduce(
    (sum, order) => sum + order.discountCents,
    0
  );

  const STATUS_LABELS: Record<string, string> = {
    pending_payment: "Awaiting payment",
    paid: "Paid",
    shipped: "Shipped",
    cancelled: "Cancelled",
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        {RANGES.map((r) => (
          <Link
            key={r}
            href={`/admin/analytics?range=${r}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              range === r
                ? "bg-ink text-canvas"
                : "border border-silver text-slate-ui hover:border-aqua hover:text-aqua-deep"
            }`}
          >
            {r} days
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatMoney(revenue)} hint="Confirmed orders" />
        <StatCard label="Confirmed orders" value={String(confirmed.length)} />
        <StatCard label="Average order value" value={formatMoney(aov)} />
        <StatCard label="Units sold" value={String(unitsSold)} />
      </div>

      {/* Daily revenue chart */}
      <div className="mt-8 rounded-2xl border border-silver bg-card p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-ui">
          Daily revenue
        </h2>
        <div className="mt-5 flex h-44 items-end gap-[3px]">
          {days.map((day, index) => (
            <div
              key={index}
              className="group relative flex-1"
              title={`${day.label}: ${formatMoney(day.cents)}`}
            >
              <div
                className="w-full rounded-t bg-gradient-to-t from-aqua-deep to-aqua transition-all duration-500 group-hover:from-flame group-hover:to-flame-deep"
                style={{
                  height: `${Math.max((day.cents / maxDay) * 160, day.cents > 0 ? 6 : 2)}px`,
                  opacity: day.cents > 0 ? 1 : 0.15,
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-faint">
          <span>{days[0]?.label}</span>
          <span>{days[days.length - 1]?.label}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-2xl border border-silver bg-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-ui">
            Top products by revenue
          </h2>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-faint">No confirmed sales in range.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topProducts.map((product) => (
                <li key={product.name}>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{product.name}</span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(product.cents)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-silver-bright">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-aqua to-flame transition-all duration-700"
                      style={{ width: `${(product.cents / maxProduct) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-faint">
                    {product.units} unit(s)
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Breakdowns */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-silver bg-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-ui">
              Orders by status
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[...statusCounts.entries()].map(([status, count]) => (
                <li key={status} className="flex justify-between">
                  <span className="text-slate-ui">
                    {STATUS_LABELS[status] ?? status}
                  </span>
                  <span className="font-semibold text-foreground">{count}</span>
                </li>
              ))}
              {statusCounts.size === 0 && (
                <li className="text-faint">No orders in range.</li>
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-silver bg-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-ui">
              Payments &amp; referrals
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[...paymentCounts.entries()].map(([method, count]) => (
                <li key={method} className="flex justify-between">
                  <span className="capitalize text-slate-ui">
                    {method} preference
                  </span>
                  <span className="font-semibold text-foreground">{count}</span>
                </li>
              ))}
              <li className="flex justify-between">
                <span className="text-slate-ui">Referred orders</span>
                <span className="font-semibold text-foreground">{referredCount}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-ui">Discounts given</span>
                <span className="font-semibold text-foreground">
                  {formatMoney(discountsGiven)}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
