import type { ReactNode } from "react";
import { RUO_NOTICE } from "@/lib/constants";
import { Reveal } from "@/components/reveal";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Reveal>
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <div className="mt-6 rounded-xl border border-flame/25 bg-flame-soft p-4 text-xs leading-relaxed text-slate-ui">
          {RUO_NOTICE}
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-slate-ui [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </Reveal>
    </div>
  );
}
