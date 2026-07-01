"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { signIn, signOut } from "@/auth";
import { consumeAuthToken, createAuthToken } from "@/lib/tokens";
import { sendEmailVerification, sendPasswordReset } from "@/lib/email";

export type AuthFormState = {
  error?: string;
  success?: string;
  unverifiedEmail?: string;
};

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function registerUser(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const email = parsed.data.email.toLowerCase();
  const db = getDb();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    if (!existing.emailVerifiedAt) {
      const token = await createAuthToken(existing.id, "email_verification");
      await sendEmailVerification(email, token);
      redirect(`/verify-email/check?email=${encodeURIComponent(email)}`);
    }
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const [created] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email,
      passwordHash,
      role: "customer",
    })
    .returning();

  const token = await createAuthToken(created.id, "email_verification");
  await sendEmailVerification(email, token);
  redirect(`/verify-email/check?email=${encodeURIComponent(email)}`);
}

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function authenticate(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const email = parsed.data.email.toLowerCase();
  const requestedRedirect = (formData.get("redirectTo") as string) || "";

  // Pre-check verification so the UI can offer a resend link.
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user && !user.emailVerifiedAt) {
    const matches = await bcrypt.compare(
      parsed.data.password,
      user.passwordHash
    );
    if (matches) {
      return {
        error: "Please verify your email before signing in.",
        unverifiedEmail: email,
      };
    }
  }

  // Admins land on the admin dashboard by default; customers land on their account.
  const redirectTo =
    requestedRedirect || (user?.role === "admin" ? "/admin" : "/account");

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
  return {};
}

export async function resendVerificationEmail(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!email) return { error: "Missing email." };

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user && !user.emailVerifiedAt) {
    const token = await createAuthToken(user.id, "email_verification");
    await sendEmailVerification(email, token);
  }
  return { success: "If that account needs verification, we sent a new link." };
}

export async function verifyEmailToken(token: string) {
  const record = await consumeAuthToken(token, "email_verification");
  if (!record) return { ok: false as const };

  const db = getDb();
  await db
    .update(users)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(users.id, record.userId));
  return { ok: true as const };
}

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = z.email().safeParse(formData.get("email"));
  const genericSuccess = {
    success: "If an account exists for that email, a reset link is on its way.",
  };
  if (!parsed.success) return genericSuccess;

  const email = parsed.data.toLowerCase();
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user) {
    const token = await createAuthToken(user.id, "password_reset");
    await sendPasswordReset(email, token);
  }
  return genericSuccess;
}

const resetSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function resetPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const record = await consumeAuthToken(parsed.data.token, "password_reset");
  if (!record) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const db = getDb();
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, record.userId));

  redirect("/login?reset=1");
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
