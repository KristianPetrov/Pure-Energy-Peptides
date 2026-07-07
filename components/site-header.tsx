import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";
import { LogoMark, LogoWordmark } from "./logo";
import { CartButton } from "./cart-button";
import { MobileMenu } from "./mobile-menu";
import { StickyHeader } from "./sticky-header";

const NAV_LINKS = [
  { href: "/store", label: "Store" },
  { href: "/science", label: "Science" },
  { href: "/compliance", label: "Compliance" },
  { href: "/track", label: "Track Order" },
];

async function SessionLinks() {
  const session = await auth();
  const user = session?.user;

  return user ? (
    <>
      {user.role === "admin" ? (
        <Link
          href="/admin"
          className="rounded-full px-3 py-2 text-sm font-medium text-flame transition-colors hover:bg-flame/15"
        >
          Admin
        </Link>
      ) : (
        <Link
          href="/account"
          className="rounded-full px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-aqua"
        >
          Account
        </Link>
      )}
      <form action={logout}>
        <button
          type="submit"
          className="rounded-full px-3 py-2 text-sm font-medium text-white/45 transition-colors hover:bg-white/10 hover:text-white"
        >
          Sign out
        </button>
      </form>
    </>
  ) : (
    <Link
      href="/login"
      className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-aqua"
    >
      Sign in
    </Link>
  );
}

async function SessionMobileMenu() {
  const session = await auth();
  const user = session?.user;

  return (
    <MobileMenu
      links={NAV_LINKS}
      isSignedIn={!!user}
      isAdmin={user?.role === "admin"}
    />
  );
}

function MobileMenuFallback() {
  return (
    <div className="md:hidden">
      <div className="h-10 w-10 rounded-full border border-white/15 bg-white/5" />
    </div>
  );
}

export function SiteHeader() {
  return (
    <StickyHeader>
      <div className="border-b border-white/10 bg-ink/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg transition-opacity hover:opacity-80"
          >
            <LogoMark />
            <LogoWordmark />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-aqua"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <Suspense fallback={null}>
                <SessionLinks />
              </Suspense>
            </div>
            <CartButton />
            <Suspense fallback={<MobileMenuFallback />}>
              <SessionMobileMenu />
            </Suspense>
          </div>
        </div>
      </div>
    </StickyHeader>
  );
}
