"use server";

import { revalidatePath, updateTag } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { orders, products } from "@/db/schema";
import { getOrderWithItems } from "@/lib/data";
import {
  sendOrderCancelled,
  sendOrderShipped,
  sendPaymentReceived,
} from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

function revalidateAdmin() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/analytics");
}

export type ActionResult = { ok: boolean; error?: string };

const uuidSchema = z.uuid();

export async function markOrderPaid(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = uuidSchema.safeParse(orderId);
  if (!parsed.success) return { ok: false, error: "Invalid order." };

  const db = getDb();
  const [updated] = await db
    .update(orders)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(orders.id, parsed.data))
    .returning();
  if (!updated) return { ok: false, error: "Order not found." };

  const order = await getOrderWithItems(updated.id);
  if (order) await sendPaymentReceived(order);

  revalidateAdmin();
  return { ok: true };
}

const shipSchema = z.object({
  orderId: z.uuid(),
  carrier: z.string().min(2, "Enter a carrier."),
  trackingNumber: z.string().min(4, "Enter a tracking number."),
});

export async function markOrderShipped(input: {
  orderId: string;
  carrier: string;
  trackingNumber: string;
}): Promise<ActionResult> {
  await requireAdmin();
  const parsed = shipSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const db = getDb();
  const [updated] = await db
    .update(orders)
    .set({
      status: "shipped",
      carrier: parsed.data.carrier,
      trackingNumber: parsed.data.trackingNumber,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, parsed.data.orderId))
    .returning();
  if (!updated) return { ok: false, error: "Order not found." };

  const order = await getOrderWithItems(updated.id);
  if (order) await sendOrderShipped(order);

  revalidateAdmin();
  return { ok: true };
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = uuidSchema.safeParse(orderId);
  if (!parsed.success) return { ok: false, error: "Invalid order." };

  const db = getDb();
  const order = await getOrderWithItems(parsed.data);
  if (!order) return { ok: false, error: "Order not found." };

  if (order.status !== "cancelled") {
    for (const item of order.items) {
      if (item.productId) {
        await db
          .update(products)
          .set({ inventory: sql`${products.inventory} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }
    }
  }

  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(orders.id, order.id));

  await sendOrderCancelled({ ...order, status: "cancelled" });

  revalidateAdmin();
  updateTag("products");
  return { ok: true };
}

const productUpdateSchema = z.object({
  productId: z.uuid(),
  priceCents: z.number().int().min(0),
  inventory: z.number().int().min(0),
  active: z.boolean(),
  featured: z.boolean(),
});

export async function updateProductFull(input: {
  productId: string;
  priceCents: number;
  inventory: number;
  active: boolean;
  featured: boolean;
}): Promise<ActionResult> {
  await requireAdmin();
  const parsed = productUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const db = getDb();
  await db
    .update(products)
    .set({
      priceCents: parsed.data.priceCents,
      inventory: parsed.data.inventory,
      active: parsed.data.active,
      featured: parsed.data.featured,
    })
    .where(eq(products.id, parsed.data.productId));

  revalidatePath("/admin/inventory");
  updateTag("products");
  return { ok: true };
}

export async function updateInventory(
  productId: string,
  inventory: number
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({ productId: z.uuid(), inventory: z.number().int().min(0) })
    .safeParse({ productId, inventory });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const db = getDb();
  await db
    .update(products)
    .set({ inventory: parsed.data.inventory })
    .where(eq(products.id, parsed.data.productId));

  revalidatePath("/admin/inventory");
  updateTag("products");
  return { ok: true };
}
