"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileMenu({
  links,
  isSignedIn,
  isAdmin,
}: {
  links: { href: string; label: string }[];
  isSignedIn: boolean;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-aqua"
        aria-label="Toggle menu"
      >
        {open ? (
          <X className="h-4.5 w-4.5" strokeWidth={1.8} />
        ) : (
          <Menu className="h-4.5 w-4.5" strokeWidth={1.8} />
        )}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-white/10 bg-ink/98 shadow-lg backdrop-blur-xl animate-fade-in">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-aqua"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-white/10" />
            {isSignedIn ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-flame transition-colors hover:bg-flame/15"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-aqua"
                >
                  Account
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-aqua"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
