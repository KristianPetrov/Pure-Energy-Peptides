import "server-only";
import { createHash, randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { authTokens } from "@/db/schema";

type TokenType = "email_verification" | "password_reset";

const TOKEN_TTL_MS: Record<TokenType, number> = {
  email_verification: 24 * 60 * 60 * 1000,
  password_reset: 60 * 60 * 1000,
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAuthToken(userId: string, type: TokenType) {
  const db = getDb();
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS[type]);

  await db
    .delete(authTokens)
    .where(and(eq(authTokens.userId, userId), eq(authTokens.type, type)));
  await db.insert(authTokens).values({ userId, type, tokenHash, expiresAt });

  return rawToken;
}

export async function consumeAuthToken(rawToken: string, type: TokenType) {
  const db = getDb();
  const tokenHash = hashToken(rawToken);
  const [record] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.tokenHash, tokenHash),
        eq(authTokens.type, type),
        gt(authTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!record) return null;

  await db.delete(authTokens).where(eq(authTokens.id, record.id));
  return record;
}
