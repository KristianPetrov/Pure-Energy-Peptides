"use client";

import { useEffect, useId, useRef } from "react";

/**
 * A circuit-board field behind each product. On hover—or while centered in
 * the viewport on touch devices—the traces power inward, illuminate their
 * nodes, and send repeating current pulses toward the central processor.
 */

const CIRCUIT_PATHS = [
  "M -8 38 H62 V66 H118 V102 H184",
  "M -8 126 H48 V108 H102 V132 H184",
  "M -8 222 H70 V192 H124 V158 H184",
  "M 408 38 H338 V66 H282 V102 H216",
  "M 408 126 H352 V108 H298 V132 H216",
  "M 408 222 H330 V192 H276 V158 H216",
  "M 76 -8 V30 H142 V78 H184",
  "M 324 -8 V30 H258 V78 H216",
  "M 92 268 V228 H146 V180 H184",
  "M 308 268 V228 H254 V180 H216",
];

const CIRCUIT_NODES = [
  [62, 38],
  [118, 66],
  [48, 126],
  [102, 108],
  [70, 222],
  [124, 192],
  [338, 38],
  [282, 66],
  [352, 126],
  [298, 108],
  [330, 222],
  [276, 192],
  [142, 30],
  [258, 30],
  [146, 228],
  [254, 228],
] as const;

export function WireConnect({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  // Unique per instance; sanitized because url(#…) chokes on useId's
  // delimiter characters in some browsers.
  const gradientId = `wire-grad-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Pointer devices animate via :hover; touch devices power the circuit
    // while the product stage sits in the middle band of the viewport.
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
      viewBox="0 0 400 260"
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

      <path
        className="circuit-grid"
        d="M0 32H400 M0 82H400 M0 130H400 M0 180H400 M0 230H400 M42 0V260 M98 0V260 M154 0V260 M200 0V260 M246 0V260 M302 0V260 M358 0V260"
      />

      <g className="circuit-base">
        {CIRCUIT_PATHS.map((path) => (
          <path key={path} d={path} />
        ))}
        {CIRCUIT_NODES.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} className="circuit-node" cx={cx} cy={cy} r="3" />
        ))}
      </g>

      <g className="circuit-charge" stroke={`url(#${gradientId})`}>
        {CIRCUIT_PATHS.map((path, index) => (
          <path
            key={path}
            d={path}
            pathLength="1"
            style={{ animationDelay: `${0.08 + index * 0.055}s` }}
          />
        ))}
      </g>

      <g className="circuit-current" stroke={`url(#${gradientId})`}>
        {CIRCUIT_PATHS.map((path, index) => (
          <path
            key={path}
            d={path}
            pathLength="1"
            style={{ animationDelay: `${0.9 + index * 0.075}s` }}
          />
        ))}
      </g>

      <g className="circuit-nodes-live">
        {CIRCUIT_NODES.map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="4"
            style={{ animationDelay: `${0.36 + index * 0.035}s` }}
          />
        ))}
      </g>

      <g className="circuit-hub">
        <path
          className="circuit-pins"
          d="M174 108H162 M174 122H158 M174 138H158 M174 152H162 M226 108H238 M226 122H242 M226 138H242 M226 152H238"
        />
        <rect className="circuit-chip" x="174" y="96" width="52" height="68" rx="8" />
        <rect className="circuit-chip-inner" x="183" y="106" width="34" height="48" rx="5" />
        <circle className="circuit-core-ring" cx="200" cy="130" r="12" />
        <circle className="circuit-core" cx="200" cy="130" r="4" />
      </g>
    </svg>
  );
}
