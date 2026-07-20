import type { NextAuthConfig } from "next-auth";

// Edge-safe configuration: no database or bcrypt imports.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role === "admin" ? "admin" : "customer";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role === "admin" ? "admin" : "customer";
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "admin";

      if (pathname.startsWith("/admin")) {
        if (isLoggedIn && isAdmin) return true;
        if (isLoggedIn) {
          return Response.redirect(new URL("/account", request.nextUrl));
        }
        const url = new URL("/login", request.nextUrl);
        url.searchParams.set("redirectTo", pathname);
        return Response.redirect(url);
      }
      if (pathname.startsWith("/account")) {
        if (isLoggedIn && isAdmin) {
          return Response.redirect(new URL("/admin", request.nextUrl));
        }
        if (isLoggedIn) return true;
        const url = new URL("/login", request.nextUrl);
        url.searchParams.set("redirectTo", pathname);
        return Response.redirect(url);
      }
      return true;
    },
  },
} satisfies NextAuthConfig;

declare module "next-auth" {
  interface User {
    role?: "customer" | "admin";
  }
  interface Session {
    user: {
      id: string;
      role: "customer" | "admin";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
