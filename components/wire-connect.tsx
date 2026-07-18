"use client";

import { useEffect, useId, useRef } from "react";

/**
 * Two disconnected wire leads reaching toward each other. When the card is
 * hovered (or, on touch devices, scrolled through the middle of the
 * viewport), the leads slide together, a spark bursts at the contact point,
 * and current flows along the joined wire as an animated aqua-to-flame dash
 * with a traveling pulse. All motion lives in globals.css keyed off the
 * parent `.group:hover` and the `.wire-live` class set here.
 */

const SPARK_ANGLES = [0, 60, 120, 180, 240, 300];

export function WireConnect({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  // Unique per instance; sanitized because url(#…) chokes on useId's
  // delimiter characters in some browsers.
  const gradientId = `wire-grad-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Pointer devices animate via :hover; touch devices connect the wires
    // while the card sits in the middle band of the viewport.
    if (window.matchMedia("(hover: hover)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("wire-live", entry.isIntersecting);
        }
      },
      { rootMargin: "-35% 0px -35% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={`wire-conn ${className}`}
      viewBox="0 0 400 48"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="400"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          {/* style, not stopColor: var() is unreliable in SVG attributes */}
          <stop offset="0" style={{ stopColor: "var(--aqua)" }} />
          <stop offset="1" style={{ stopColor: "var(--flame)" }} />
        </linearGradient>
      </defs>

      {/* Live current along the joined wire (connected geometry). */}
      <path
        className="wire-current"
        d="M -8 12 C 70 12, 148 34, 200 34 C 252 34, 330 12, 408 12"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <g className="wire-half wire-half-l">
        <path
          className="wire-lead"
          d="M -38 12 C 40 12, 118 34, 170 34"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle className="wire-tip" cx="170" cy="34" r="3.5" />
        <circle className="wire-tip-core" cx="170" cy="34" r="1.4" />
      </g>

      <g className="wire-half wire-half-r">
        <path
          className="wire-lead"
          d="M 438 12 C 360 12, 282 34, 230 34"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle className="wire-tip" cx="230" cy="34" r="3.5" />
        <circle className="wire-tip-core" cx="230" cy="34" r="1.4" />
      </g>

      {/* Spark burst at the contact point. */}
      <g transform="translate(200 34)">
        <g className="wire-spark">
          <circle className="wire-spark-glow" r="5" />
          {SPARK_ANGLES.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            return (
              <line
                key={deg}
                x1={(4.5 * cos).toFixed(2)}
                y1={(4.5 * sin).toFixed(2)}
                x2={(10 * cos).toFixed(2)}
                y2={(10 * sin).toFixed(2)}
              />
            );
          })}
        </g>
      </g>

      {/* Bright pulse traveling the connected wire (offset-path in CSS). */}
      <circle className="wire-pulse" r="2.6" />
    </svg>
  );
}
