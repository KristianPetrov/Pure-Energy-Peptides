"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { RUO_NOTICE } from "@/lib/constants";

const SCROLL_HIDE_THRESHOLD = 32;
const SCROLL_SHOW_THRESHOLD = 8;

type StickyHeaderProps = {
  children: ReactNode;
};

export function StickyHeader({ children }: StickyHeaderProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [bannerHeight, setBannerHeight] = useState(0);
  const [navHeight, setNavHeight] = useState(0);
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    const banner = bannerRef.current;
    const nav = navRef.current;
    if (!banner || !nav) return;

    const measure = () => {
      setBannerHeight(banner.offsetHeight);
      setNavHeight(nav.offsetHeight);
      setMeasured(true);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(banner);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setVisible((prev) => {
          if (!prev && y <= SCROLL_SHOW_THRESHOLD) return true;
          if (prev && y >= SCROLL_HIDE_THRESHOLD) return false;
          return prev;
        });
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const collapsed = !visible && measured && bannerHeight > 0;

  return (
    <header
      className="sticky top-0 z-40 overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
      style={
        measured
          ? { height: collapsed ? navHeight : bannerHeight + navHeight }
          : undefined
      }
    >
      <div
        className="transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          transform: collapsed ? `translateY(-${bannerHeight}px)` : undefined,
        }}
      >
        <div
          ref={bannerRef}
          className="iridescent-dark border-b border-white/10"
          aria-hidden={collapsed}
        >
          <p className="mx-auto max-w-6xl px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-white/55">
            {RUO_NOTICE}
          </p>
        </div>
        <div ref={navRef}>{children}</div>
      </div>
    </header>
  );
}
