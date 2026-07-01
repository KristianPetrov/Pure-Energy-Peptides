"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { referralCodes, referralPartners } from "@/db/schema";
import {
  isValidReferralCodeFormat,
  normalizeReferralCode,
} from "@/lib/referral";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export type ActionResult = { ok: boolean; error?: string };

const partnerSchema = z.object({
  name: z.string().min(2, "Enter a partner name."),
  email: z.union([z.email(), z.literal("")]).optional(),
  notes: z.string().optional(),
});

export async function createReferralPartner(input: {
  name: string;
  email?: string;
  notes?: string;
}): Promise<ActionResult> {
  await requireAdmin();
  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const db = getDb();
  await db.insert(referralPartners).values({
    name: parsed.data.name,
    email: parsed.data.email || null,
    notes: parsed.data.notes || null,
    active: true,
  });

  revalidatePath("/admin/referrals");
  return { ok: true };
}

export async function toggleReferralPartner(
  partnerId: string,
  active: boolean
): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(partnerId).success) {
    return { ok: false, error: "Invalid partner." };
  }

  const db = getDb();
  await db
    .update(referralPartners)
    .set({ active })
    .where(eq(referralPartners.id, partnerId));

  revalidatePath("/admin/referrals");
  return { ok: true };
}

const codeSchema = z
  .object({
    partnerId: z.uuid(),
    code: z.string().min(2, "Enter a code."),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z.number().int().min(1, "Discount must be positive."),
    minSubtotalCents: z.number().int().min(0),
  })
  .refine(
    (data) =>
      data.discountType !== "percent" ||
      (data.discountValue >= 1 && data.discountValue <= 100),
    { message: "Percent discounts must be between 1 and 100." }
  );

export async function createReferralCode(input: {
  partnerId: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minSubtotalCents: number;
}): Promise<ActionResult> {
  await requireAdmin();
  const parsed = codeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const code = normalizeReferralCode(parsed.data.code);
  if (!isValidReferralCodeFormat(code)) {
    return {
      ok: false,
      error: "Codes may only contain letters, numbers, and dashes.",
    };
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: referralCodes.id })
    .from(referralCodes)
    .where(eq(referralCodes.code, code))
    .limit(1);
  if (existing) {
    return { ok: false, error: "This code already exists." };
  }

  await db.insert(referralCodes).values({
    partnerId: parsed.data.partnerId,
    code,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
    minSubtotalCents: parsed.data.minSubtotalCents,
    active: true,
  });

  revalidatePath("/admin/referrals");
  return { ok: true };
}

export async function toggleReferralCode(
  codeId: string,
  active: boolean
): Promise<ActionResult> {
  await requireAdmin();
  if (!z.uuid().safeParse(codeId).success) {
    return { ok: false, error: "Invalid code." };
  }

  const db = getDb();
  await db
    .update(referralCodes)
    .set({ active })
    .where(eq(referralCodes.id, codeId));

  revalidatePath("/admin/referrals");
  return { ok: true };
}
