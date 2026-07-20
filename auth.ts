import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role === "admin" ? "admin" : "customer";
        return token;
      }

      // Keep role in sync with the database so promoting an account to admin
      // takes effect without waiting for an old customer JWT to expire.
      if (token.id) {
        try {
          const db = getDb();
          const [dbUser] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, token.id as string))
            .limit(1);
          if (dbUser) {
            token.role = dbUser.role === "admin" ? "admin" : "customer";
          }
        } catch {
          // Fall back to the role already stored on the token.
        }
      }

      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const db = getDb();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;
        if (!user.emailVerifiedAt) return null;

        const matches = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!matches) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
