import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  orderItems,
  orders,
  products,
  referralCodes,
  referralPartners,
  type Order,
  type OrderItem,
} from "@/db/schema";

export type OrderWithItems = Order & { items: OrderItem[] };

export async function getActiveProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const db = getDb();
  return db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(desc(products.featured), asc(products.category), asc(products.name));
}

export async function getFeaturedProducts(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const db = getDb();
  return db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.featured, true)))
    .orderBy(asc(products.name))
    .limit(limit);
}

export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const db = getDb();
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return product ?? null;
}

export async function getActiveProductVariantsByName(name: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const db = getDb();
  return db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.name, name)))
    .orderBy(asc(products.priceCents));
}

export async function getActiveProductSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  const db = getDb();
  return db
    .select({
      slug: products.slug,
      image: products.image,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.slug));
}

export async function getAllProducts() {
  const db = getDb();
  return db
    .select()
    .from(products)
    .orderBy(asc(products.category), asc(products.name));
}

export async function getOrderItems(orderId: string) {
  const db = getDb();
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getOrdersForUser(userId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
  return attachItems(rows);
}

export async function getAllOrders() {
  const db = getDb();
  return db.select()
  .from(orders)
  .orderBy(desc(orders.createdAt));
}

export async function getAllOrdersWithItems() {
  const rows = await getAllOrders();
  return attachItems(rows);
}

async function attachItems(rows: Order[]): Promise<OrderWithItems[]> {
  if (rows.length === 0) return [];
  const db = getDb();
  const items = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        rows.map((row) => row.id)
      )
    );
  const byOrder = new Map<string, OrderItem[]>();
  for (const item of items) {
    const list = byOrder.get(item.orderId) ?? [];
    list.push(item);
    byOrder.set(item.orderId, list);
  }
  return rows.map((row) => ({ ...row, items: byOrder.get(row.id) ?? [] }));
}

export async function getOrderWithItems(orderId: string) {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return null;
  const items = await getOrderItems(order.id);
  return { ...order, items };
}

export async function getOrderByReference(reference: string) {
  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.reference, reference.toUpperCase()))
    .limit(1);
  if (!order) return null;
  const items = await getOrderItems(order.id);
  return { ...order, items };
}

export type ReferralCodeWithStats = {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minSubtotalCents: number;
  active: boolean;
  usedCount: number;
  confirmedOrders: number;
  confirmedRevenueCents: number;
  discountsGivenCents: number;
};

export type PartnerWithCodes = {
  id: string;
  name: string;
  email: string | null;
  notes: string | null;
  active: boolean;
  createdAt: Date;
  codes: ReferralCodeWithStats[];
};

export async function getReferralPartnersWithCodes(): Promise<
  PartnerWithCodes[]
> {
  const db = getDb();
  const partners = await db
    .select()
    .from(referralPartners)
    .orderBy(desc(referralPartners.createdAt));
  const codes = await db
    .select()
    .from(referralCodes)
    .orderBy(desc(referralCodes.createdAt));

  const stats = await db
    .select({
      referralCodeId: orders.referralCodeId,
      confirmedOrders: sql<number>`count(*)::int`,
      confirmedRevenueCents: sql<number>`coalesce(sum(${orders.totalCents}), 0)::int`,
      discountsGivenCents: sql<number>`coalesce(sum(${orders.discountCents}), 0)::int`,
    })
    .from(orders)
    .where(
      and(
        or(eq(orders.status, "paid"), eq(orders.status, "shipped")),
        sql`${orders.referralCodeId} is not null`
      )
    )
    .groupBy(orders.referralCodeId);

  const statsByCode = new Map(stats.map((s) => [s.referralCodeId, s]));

  return partners.map((partner) => ({
    ...partner,
    codes: codes
      .filter((code) => code.partnerId === partner.id)
      .map((code) => {
        const stat = statsByCode.get(code.id);
        return {
          id: code.id,
          code: code.code,
          discountType: code.discountType,
          discountValue: code.discountValue,
          minSubtotalCents: code.minSubtotalCents,
          active: code.active,
          usedCount: code.usedCount,
          confirmedOrders: stat?.confirmedOrders ?? 0,
          confirmedRevenueCents: stat?.confirmedRevenueCents ?? 0,
          discountsGivenCents: stat?.discountsGivenCents ?? 0,
        };
      }),
  }));
}
