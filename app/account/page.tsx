import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageOpen } from "lucide-react";
import { auth } from "@/auth";
import { getOrdersForUser, type OrderWithItems } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Reveal } from "@/components/reveal";


export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectTo=/account");
  }
  if (session.user.role === "admin") {
    redirect("/admin");
  }

  let orders: OrderWithItems[] = [];
  try {
    orders = await getOrdersForUser(session.user.id);
  } catch {
    // Render an empty history if the database is unavailable.
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Your account</h1>
        <p className="mt-2 text-sm text-slate-ui">
          Signed in as{" "}
          <span className="font-medium text-foreground">{session.user.email}</span>
        </p>
      </Reveal>

      <Reveal delay={100}>
        <h2 className="mt-12 text-lg font-semibold text-foreground">Order history</h2>
      </Reveal>

      {orders.length === 0 ? (
        <Reveal delay={160}>
          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-silver bg-frost py-16 text-center">
            <PackageOpen className="h-8 w-8 text-faint" strokeWidth={1.5} />
            <p className="text-sm text-slate-ui">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-aqua-deep to-aqua px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Browse the catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order, index) => (
            <Reveal key={order.id} delay={index * 60}>
              <Link
                href={`/order/${order.reference}`}
                className="card-lift flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-silver bg-card p-5"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-foreground">
                    {order.reference}
                  </p>
                  <p className="mt-0.5 text-xs text-faint">
                    {formatDate(order.createdAt)} ·{" "}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-sm font-bold text-foreground">
                    {formatMoney(order.totalCents)}
                  </p>
                  <ArrowRight className="h-4 w-4 text-faint" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
