"use client";

import { useActionState } from "react";
import { Search } from "lucide-react";
import { lookupOrder, type LookupState } from "@/app/actions/orders";

export function TrackForm ({ initialReference }: { initialReference?: string })
{
  const [state, formAction, pending] = useActionState<LookupState, FormData>(
    lookupOrder,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="reference"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Order reference
        </label>
        <input
          id="reference"
          name="reference"
          defaultValue={initialReference}
          placeholder="PEP-XXXXXX"
          required
          className="w-full rounded-xl border border-silver bg-card px-4 py-3 text-sm uppercase tracking-wider outline-none transition-colors focus:border-aqua focus:ring-2 focus:ring-aqua/20"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Email used at checkout
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@lab.com"
          required
          className="w-full rounded-xl border border-silver bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-aqua focus:ring-2 focus:ring-aqua/20"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-flame-soft px-4 py-3 text-sm text-flame-deep animate-fade-in">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-aqua-deep to-aqua px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-aqua/20 transition-all hover:scale-[1.02] disabled:opacity-60"
      >
        <Search className="h-4 w-4" />
        {pending ? "Looking up..." : "Find my order"}
      </button>
    </form>
  );
}
