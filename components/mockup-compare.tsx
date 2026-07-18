"use client";

import { useState } from "react";
import Image from "next/image";

type Version = "new" | "ai";

const SOURCES: Record<Version, { dir: string; label: string }> = {
  new: { dir: "/products/mockups", label: "New — programmatic" },
  ai: { dir: "/products/mockups-ai", label: "Old — AI generated" },
};

export function MockupCompare({ names }: { names: string[] }) {
  const [version, setVersion] = useState<Version>("new");
  const [overrides, setOverrides] = useState<Record<string, Version>>({});

  const flip = (name: string) => {
    setOverrides((prev) => {
      const current = prev[name] ?? version;
      return { ...prev, [name]: current === "new" ? "ai" : "new" };
    });
  };

  const selectAll = (next: Version) => {
    setVersion(next);
    setOverrides({});
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">
            Mockup <span className="text-gradient-brand">comparison</span>
          </h1>
          <p className="mt-4 text-slate-ui">
            Flip between the programmatically composited bottles and the old
            AI-generated ones. Use the toggle to switch every image at once, or
            click any bottle to flip just that one.
          </p>
        </div>

        <div
          role="group"
          aria-label="Select mockup version for all images"
          className="flex rounded-full border border-silver bg-card p-1"
        >
          {(Object.keys(SOURCES) as Version[]).map((key) => {
            const active = version === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectAll(key)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-aqua text-shell shadow-sm"
                    : "text-slate-ui hover:text-aqua-deep"
                }`}
              >
                {SOURCES[key].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {names.map((name) => {
          const shown = overrides[name] ?? version;
          const isAi = shown === "ai";
          return (
            <button
              key={name}
              type="button"
              onClick={() => flip(name)}
              title="Click to flip this mockup"
              className="card-lift group flex flex-col overflow-hidden rounded-xl border border-silver bg-card text-left sm:rounded-2xl"
            >
              <div className="iridescent relative flex aspect-square items-center justify-center">
                <Image
                  key={shown}
                  src={`${SOURCES[shown].dir}/${name}.png`}
                  alt={`${name} — ${SOURCES[shown].label}`}
                  width={320}
                  height={480}
                  className="h-full w-full object-contain animate-fade-in"
                />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white sm:text-[10px] ${
                    isAi
                      ? "bg-gradient-to-r from-flame to-flame-deep"
                      : "bg-aqua"
                  }`}
                >
                  {isAi ? "AI" : "New"}
                </span>
              </div>
              <p className="p-3 text-xs font-semibold text-ink sm:text-sm">
                {name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
