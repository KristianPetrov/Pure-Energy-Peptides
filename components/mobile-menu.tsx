"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { logout } from "@/app/actions/auth";

const subscribeToHydration = () => () => {};

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
  const [top, setTop] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!open) return;

    const updateTop = () => {
      const header = buttonRef.current?.closest("header");
      if (header) {
        setTop(header.getBoundingClientRect().bottom);
      }
    };

    window.addEventListener("resize", updateTop);
    window.addEventListener("scroll", updateTop, { passive: true });
    return () => {
      window.removeEventListener("resize", updateTop);
      window.removeEventListener("scroll", updateTop);
    };
  }, [open]);

  const toggleMenu = () => {
    if (!open) {
      const header = buttonRef.current?.closest("header");
      if (header) setTop(header.getBoundingClientRect().bottom);
    }
    setOpen((value) => !value);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const panel = open && mounted && (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-40 bg-ink-deep/40 md:hidden"
        style={{ top }}
        onClick={() => setOpen(false)}
      />
      <div
        className="fixed inset-x-0 z-50 border-b border-white/10 bg-shell/98 shadow-lg backdrop-blur-xl animate-fade-in md:hidden"
        style={{ top }}
      >
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
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-flame transition-colors hover:bg-flame/15"
                >
                  Admin
                </Link>
              ) : (
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-aqua"
                >
                  Account
                </Link>
              )}
              <form action={logout}>
                <button
                  type="submit"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-white/45 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Sign out
                </button>
              </form>
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
    </>
  );

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:border-aqua"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        {open ? (
          <X className="h-4.5 w-4.5" strokeWidth={1.8} />
        ) : (
          <Menu className="h-4.5 w-4.5" strokeWidth={1.8} />
        )}
      </button>
      {panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
