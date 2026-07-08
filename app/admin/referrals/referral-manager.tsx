"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import {
  createReferralCode,
  createReferralPartner,
  toggleReferralCode,
  toggleReferralPartner,
} from "@/app/actions/referrals";
import { formatMoney } from "@/lib/format";

type CodeRow = {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minSubtotalCents: number;
  active: boolean;
  usedCount: number;
  confirmedOrders: number;
  confirmedRevenueCents: number;
  discountsGivenCents: number;
};

type PartnerRow = {
  id: string;
  name: string;
  email: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  codes: CodeRow[];
};

const inputClass =
  "rounded-xl border border-silver bg-card px-3 py-2.5 text-sm outline-none transition-colors focus:border-aqua";

export function ReferralManager({ partners }: { partners: PartnerRow[] }) {
  return (
    <div className="space-y-6">
      <NewPartnerForm />
      {partners.length === 0 ? (
        <div className="rounded-2xl border border-silver bg-frost p-10 text-center text-sm text-slate-ui">
          No referral partners yet — create one above.
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewPartnerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createReferralPartner({ name, email, notes });
      if (result.ok) {
        setName("");
        setEmail("");
        setNotes("");
      } else {
        setError(result.error ?? "Failed to create partner.");
      }
    });
  };

  return (
    <div className="iridescent rounded-2xl border border-silver p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-ui">
        New referral partner
      </h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Partner name"
          className={`${inputClass} flex-1 min-w-40`}
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email (optional)"
          type="email"
          className={`${inputClass} flex-1 min-w-40`}
        />
        <input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes (optional)"
          className={`${inputClass} flex-1 min-w-40`}
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || name.trim().length < 2}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-aqua-deep to-aqua px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add partner
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-flame-deep">{error}</p>}
    </div>
  );
}

function PartnerCard({ partner }: { partner: PartnerRow }) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-2xl border border-silver bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-faint transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
          <span className="truncate font-semibold text-foreground">
            {partner.name}
          </span>
          {partner.email && (
            <span className="truncate text-xs text-faint">{partner.email}</span>
          )}
          <span className="text-xs text-faint">
            {partner.codes.length} code(s)
          </span>
        </button>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-ui">
          <input
            type="checkbox"
            checked={partner.active}
            disabled={pending}
            onChange={(event) => {
              const next = event.target.checked;
              startTransition(async () => {
                await toggleReferralPartner(partner.id, next);
              });
            }}
            className="accent-aqua"
          />
          Active
        </label>
      </div>

      {expanded && (
        <div className="border-t border-silver bg-frost px-5 py-5 animate-fade-in">
          {partner.notes && (
            <p className="mb-4 text-xs text-faint">{partner.notes}</p>
          )}
          <div className="space-y-2">
            {partner.codes.map((code) => (
              <CodeRowView key={code.id} code={code} />
            ))}
          </div>
          <NewCodeForm partnerId={partner.id} />
        </div>
      )}
    </div>
  );
}

function CodeRowView({ code }: { code: CodeRow }) {
  const [pending, startTransition] = useTransition();

  const discountLabel =
    code.discountType === "percent"
      ? `${code.discountValue}% off`
      : `${formatMoney(code.discountValue)} off`;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-silver bg-card px-4 py-3">
      <span className="font-mono text-sm font-bold text-aqua-deep">
        {code.code}
      </span>
      <span className="text-xs text-slate-ui">{discountLabel}</span>
      {code.minSubtotalCents > 0 && (
        <span className="text-xs text-faint">
          min {formatMoney(code.minSubtotalCents)}
        </span>
      )}
      <span className="ml-auto flex flex-wrap items-center gap-3 text-xs text-faint">
        <span>{code.confirmedOrders} orders</span>
        <span>{formatMoney(code.confirmedRevenueCents)} revenue</span>
        <span>{formatMoney(code.discountsGivenCents)} discounted</span>
      </span>
      <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-ui">
        <input
          type="checkbox"
          checked={code.active}
          disabled={pending}
          onChange={(event) => {
            const next = event.target.checked;
            startTransition(async () => {
              await toggleReferralCode(code.id, next);
            });
          }}
          className="accent-aqua"
        />
        Active
      </label>
    </div>
  );
}

function NewCodeForm({ partnerId }: { partnerId: string }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    const numericValue =
      type === "percent"
        ? parseInt(value, 10)
        : Math.round(parseFloat(value) * 100);
    const minCents = minOrder ? Math.round(parseFloat(minOrder) * 100) : 0;

    if (Number.isNaN(numericValue) || numericValue <= 0) {
      setError("Enter a valid discount value.");
      return;
    }
    if (Number.isNaN(minCents) || minCents < 0) {
      setError("Enter a valid minimum order amount.");
      return;
    }

    startTransition(async () => {
      const result = await createReferralCode({
        partnerId,
        code,
        discountType: type,
        discountValue: numericValue,
        minSubtotalCents: minCents,
      });
      if (result.ok) {
        setCode("");
        setValue(type === "percent" ? "10" : "10.00");
        setMinOrder("");
      } else {
        setError(result.error ?? "Failed to create code.");
      }
    });
  };

  return (
    <div className="mt-4 border-t border-silver pt-4">
      <p className="text-xs font-bold uppercase tracking-wider text-faint">
        New code
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="CODE10"
          className={`${inputClass} w-32 uppercase tracking-wider`}
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value as "percent" | "fixed")}
          className={inputClass}
        >
          <option value="percent">% off</option>
          <option value="fixed">$ off</option>
        </select>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={type === "percent" ? "10" : "10.00"}
          inputMode="decimal"
          className={`${inputClass} w-24`}
        />
        <input
          value={minOrder}
          onChange={(event) => setMinOrder(event.target.value)}
          placeholder="Min order $ (optional)"
          inputMode="decimal"
          className={`${inputClass} w-44`}
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || code.trim().length < 2}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-xs font-semibold text-canvas transition-transform hover:scale-[1.03] disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Create code
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-flame-deep">{error}</p>}
    </div>
  );
}
