import type { CSSProperties, ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`reveal ${className}`}
      style={
        {
          "--reveal-offset": `${Math.min(delay / 40, 12)}%`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
