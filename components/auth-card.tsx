import type { ReactNode } from "react";
import { LogoMark } from "./logo";
import { Reveal } from "./reveal";

export const authInputClass =
  "w-full rounded-xl border border-silver bg-canvas px-4 py-3 text-sm outline-none transition-colors focus:border-aqua focus:ring-2 focus:ring-aqua/20";

export const authButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-flame to-flame-deep py-3.5 text-sm font-semibold text-white shadow-lg shadow-flame/25 transition-all hover:scale-[1.02] disabled:opacity-60";

export function AuthCard ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
})
{
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Reveal>
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={48} />
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-slate-ui">
              {subtitle}
            </p>
          )}
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="iridescent-border rounded-2xl p-6 sm:p-8">{children}</div>
      </Reveal>
    </div>
  );
}
