"use server";

import { redirect } from "next/navigation";
import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { getDb } from "@/db";
import {
  orderItems,
  orders,
  products,
  referralCodes,
  referralPartners,
  type ShippingAddress,
} from "@/db/schema";
import { getShippingOption } from "@/lib/constants";
import { generateOrderReference } from "@/lib/reference";
import {
  computeDiscountCents,
  isValidReferralCodeFormat,
  normalizeReferralCode,
} from "@/lib/referral";
import { sendAdminNewOrder, sendOrderConfirmation } from "@/lib/email";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Enter the recipient's full name."),
  email: z.email("Enter a valid email address."),
  phone: z.string().optional(),
  address1: z.string().min(3, "Enter a street address."),
  address2: z.string().optional(),
  city: z.string().min(2, "Enter a city."),
  state: z.string().min(2, "Enter a state or region."),
  postalCode: z.string().min(3, "Enter a postal code."),
  country: z.string().min(2, "Enter a country."),
  shippingMethod: z.enum(["standard", "overnight"]),
  paymentMethod: z.enum(["zelle", "venmo"]),
  referralCode: z.string().optional(),
  acceptedTerms: z.boolean(),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().min(1).max(999),
      })
    )
    .min(1, "Your cart is empty."),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;

export type PlaceOrderResult =
  | { ok: true; reference: string; email: string }
  | { ok: false; error: string };

async function findValidReferralCode(codeInput: string, subtotalCents: number) {
  const db = getDb();
  const code = normalizeReferralCode(codeInput);
  if (!code || !isValidReferralCodeFormat(code)) return null;

  const [row] = await db
    .select({
      id: referralCodes.id,
      code: referralCodes.code,
      discountType: referralCodes.discountType,
      discountValue: referralCodes.discountValue,
      minSubtotalCents: referralCodes.minSubtotalCents,
      codeActive: referralCodes.active,
      partnerActive: referralPartners.active,
    })
    .from(referralCodes)
    .innerJoin(
      referralPartners,
      eq(referralCodes.partnerId, referralPartners.id)
    )
    .where(eq(referralCodes.code, code))
    .limit(1);

  if (!row || !row.codeActive || !row.partnerActive) return null;

  const discountCents = computeDiscountCents(row, subtotalCents);
  if (discountCents <= 0) return null;

  return { id: row.id, code: row.code, discountCents };
}

export async function applyReferralCode(codeInput: string, subtotalCents: number) {
  const valid = await findValidReferralCode(codeInput, subtotalCents);
  if (!valid) {
    return {
      ok: false as const,
      error: "This code is not valid for your current cart.",
    };
  }
  return { ok: true as const, code: valid.code, discountCents: valid.discountCents };
}

export async function placeOrder(payload: unknown): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid checkout details.",
    };
  }
  const data = parsed.data;

  if (!data.acceptedTerms) {
    return {
      ok: false,
      error:
        "You must confirm you are a qualified researcher purchasing for Research Use Only.",
    };
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const db = getDb();
  const slugs = data.items.map((item) => item.slug);
  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.slug, slugs));
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  let subtotalCents = 0;
  for (const item of data.items) {
    const product = bySlug.get(item.slug);
    if (!product || !product.active) {
      return {
        ok: false,
        error: "One or more items in your cart are no longer available.",
      };
    }
    if (item.quantity > product.inventory) {
      return {
        ok: false,
        error: `Only ${product.inventory} unit(s) of ${product.name} remain in stock.`,
      };
    }
    subtotalCents += product.priceCents * item.quantity;
  }

  const referral = data.referralCode
    ? await findValidReferralCode(data.referralCode, subtotalCents)
    : null;
  if (data.referralCode && normalizeReferralCode(data.referralCode) && !referral) {
    return { ok: false, error: "The referral code is not valid for this order." };
  }
  const discountCents = referral?.discountCents ?? 0;

  const shippingOption = getShippingOption(data.shippingMethod);
  if (!shippingOption) {
    return { ok: false, error: "Select a shipping method." };
  }
  const shippingCents = shippingOption.priceCents;
  const totalCents = subtotalCents - discountCents + shippingCents;

  const email = data.email.toLowerCase();
  const shippingAddress: ShippingAddress = {
    fullName: data.fullName,
    email,
    phone: data.phone || undefined,
    address1: data.address1,
    address2: data.address2 || undefined,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
    shippingMethod: data.shippingMethod,
  };

  const reference = generateOrderReference();

  const [order] = await db
    .insert(orders)
    .values({
      reference,
      userId,
      email,
      status: "pending_payment",
      paymentMethod: data.paymentMethod,
      subtotalCents,
      shippingCents,
      discountCents,
      referralCodeId: referral?.id ?? null,
      referralCode: referral?.code ?? null,
      totalCents,
      shippingAddress,
    })
    .returning();

  if (referral) {
    await db
      .update(referralCodes)
      .set({ usedCount: sql`${referralCodes.usedCount} + 1` })
      .where(eq(referralCodes.id, referral.id));
  }

  const itemRows = data.items.map((item) => {
    const product = bySlug.get(item.slug)!;
    return {
      orderId: order.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      unitPriceCents: product.priceCents,
      quantity: item.quantity,
    };
  });
  const insertedItems = await db.insert(orderItems).values(itemRows).returning();

  for (const item of data.items) {
    await db
      .update(products)
      .set({ inventory: sql`${products.inventory} - ${item.quantity}` })
      .where(eq(products.slug, item.slug));
  }

  const orderWithItems = { ...order, items: insertedItems };
  await sendOrderConfirmation(orderWithItems);
  await sendAdminNewOrder(orderWithItems);

  return { ok: true, reference: order.reference, email: order.email };
}

export type LookupState = { error?: string };

export async function lookupOrder(
  _prev: LookupState,
  formData: FormData
): Promise<LookupState> {
  const reference = String(formData.get("reference") ?? "")
    .trim()
    .toUpperCase();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!reference || !email) {
    return { error: "Enter your order reference and email." };
  }

  const db = getDb();
  const [order] = await db
    .select({ reference: orders.reference, email: orders.email })
    .from(orders)
    .where(eq(orders.reference, reference))
    .limit(1);

  if (!order || order.email !== email) {
    return { error: "We couldn't find an order matching those details." };
  }

  redirect(`/order/${order.reference}?email=${encodeURIComponent(email)}`);
}
