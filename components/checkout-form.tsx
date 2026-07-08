"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgePercent, Loader2, Lock } from "lucide-react";
import { applyReferralCode, placeOrder } from "@/app/actions/orders";
import { SHIPPING_OPTIONS, type ShippingMethodId } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { useCart } from "./cart-provider";

const inputClass =
  "w-full rounded-xl border border-silver bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-aqua focus:ring-2 focus:ring-aqua/20";

type AppliedCode = { code: string; discountCents: number };

export function CheckoutForm ()
{
  const { items, subtotalCents, hydrated, clear } = useCart();
  const router = useRouter();

  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodId>("standard");
  const [paymentMethod, setPaymentMethod] = useState<"zelle" | "venmo">(
    "zelle"
  );
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<AppliedCode | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [codePending, startCodeTransition] = useTransition();

  // Re-validate the applied code whenever the subtotal changes.
  useEffect(() =>
  {
    if (!applied) return;
    startCodeTransition(async () =>
    {
      const result = await applyReferralCode(applied.code, subtotalCents);
      if (result.ok) {
        setApplied({ code: result.code, discountCents: result.discountCents });
      } else {
        setApplied(null);
        setCodeError("Your code no longer applies to this cart.");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotalCents]);

  const shipping = SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)!;
  const discountCents = applied?.discountCents ?? 0;
  const totalCents = subtotalCents - discountCents + shipping.priceCents;

  const handleApplyCode = () =>
  {
    setCodeError(null);
    if (!codeInput.trim()) return;
    startCodeTransition(async () =>
    {
      const result = await applyReferralCode(codeInput, subtotalCents);
      if (result.ok) {
        setApplied({ code: result.code, discountCents: result.discountCents });
        setCodeError(null);
      } else {
        setApplied(null);
        setCodeError(result.error);
      }
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) =>
  {
    event.preventDefault();
    setFormError(null);

    if (!acceptedTerms) {
      setFormError(
        "Please confirm you are a qualified researcher purchasing for Research Use Only."
      );
      return;
    }

    const form = new FormData(event.currentTarget);
    setSubmitting(true);

    const result = await placeOrder({
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? "") || undefined,
      address1: String(form.get("address1") ?? ""),
      address2: String(form.get("address2") ?? "") || undefined,
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      postalCode: String(form.get("postalCode") ?? ""),
      country: String(form.get("country") ?? ""),
      shippingMethod,
      paymentMethod,
      referralCode: applied?.code,
      acceptedTerms,
      items: items.map((item) => ({
        slug: item.slug,
        quantity: item.quantity,
      })),
    });

    if (result.ok) {
      clear();
      router.push(
        `/order/${result.reference}?email=${encodeURIComponent(result.email)}`
      );
    } else {
      setFormError(result.error);
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-aqua" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="text-slate-ui">Your cart is empty.</p>
        <Link
          href="/store"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-aqua-deep to-aqua px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-10">
        {/* Shipping details */}
        <section>
          <h2 className="text-lg font-semibold text-foreground">Shipping details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="fullName">
                Full name
              </label>
              <input id="fullName" name="fullName" required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="phone">
                Phone <span className="text-faint">(optional)</span>
              </label>
              <input id="phone" name="phone" type="tel" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="address1">
                Address
              </label>
              <input id="address1" name="address1" required className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="address2">
                Apartment, suite, etc. <span className="text-faint">(optional)</span>
              </label>
              <input id="address2" name="address2" className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="city">
                City
              </label>
              <input id="city" name="city" required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="state">
                State / region
              </label>
              <input id="state" name="state" required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="postalCode">
                Postal code
              </label>
              <input id="postalCode" name="postalCode" required className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="country">
                Country
              </label>
              <input id="country" name="country" defaultValue="United States" required className={inputClass} />
            </div>
          </div>
        </section>

        {/* Shipping method */}
        <section>
          <h2 className="text-lg font-semibold text-foreground">Shipping method</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {SHIPPING_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-5 py-4 transition-all ${shippingMethod === option.id
                    ? "border-aqua bg-aqua-soft"
                    : "border-silver bg-card hover:border-faint"
                  }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={option.id}
                    checked={shippingMethod === option.id}
                    onChange={() => setShippingMethod(option.id)}
                    className="accent-aqua"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatMoney(option.priceCents)}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Payment preference */}
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            Preferred payment method
          </h2>
          <p className="mt-1 text-sm text-faint">
            Payment is completed manually after checkout; you&apos;ll receive
            instructions for both options.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(["zelle", "venmo"] as const).map((method) => (
              <label
                key={method}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-5 py-4 transition-all ${paymentMethod === method
                    ? "border-flame bg-flame-soft"
                    : "border-silver bg-card hover:border-faint"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  className="accent-[#ff7a00]"
                />
                <span className="text-sm font-medium capitalize text-foreground">
                  {method}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Referral code */}
        <section>
          <h2 className="text-lg font-semibold text-foreground">Referral code</h2>
          <div className="mt-4 flex gap-3">
            <input
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
              placeholder="Enter code"
              className={`${inputClass} uppercase tracking-wider`}
            />
            <button
              type="button"
              onClick={handleApplyCode}
              disabled={codePending}
              className="shrink-0 rounded-xl border-2 border-aqua px-5 text-sm font-semibold text-aqua-deep transition-colors hover:bg-aqua-soft disabled:opacity-60"
            >
              {codePending ? "Checking..." : "Apply"}
            </button>
          </div>
          {applied && (
            <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-aqua-soft px-3 py-1.5 text-xs font-semibold text-aqua-deep animate-fade-in">
              <BadgePercent className="h-3.5 w-3.5" />
              {applied.code} applied — you save {formatMoney(applied.discountCents)}
            </p>
          )}
          {codeError && (
            <p className="mt-2.5 text-xs text-flame-deep animate-fade-in">
              {codeError}
            </p>
          )}
        </section>
      </div>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-32 h-fit">
        <div className="iridescent-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.slug} className="flex items-center gap-3">
                <div className="iridescent flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-silver p-1">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-faint">× {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatMoney(item.priceCents * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-silver pt-4 text-sm">
            <div className="flex justify-between text-slate-ui">
              <span>Subtotal</span>
              <span>{formatMoney(subtotalCents)}</span>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between text-aqua-deep">
                <span>Discount ({applied?.code})</span>
                <span>-{formatMoney(discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-ui">
              <span>Shipping</span>
              <span>{formatMoney(shipping.priceCents)}</span>
            </div>
            <div className="flex justify-between border-t border-silver pt-3 text-base font-bold text-foreground">
              <span>Total</span>
              <span>{formatMoney(totalCents)}</span>
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-flame/25 bg-flame-soft p-4">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-0.5 accent-[#ff7a00]"
            />
            <span className="text-xs leading-relaxed text-slate-ui">
              I confirm that I am a qualified researcher and that all products
              in this order are purchased strictly for in-vitro laboratory
              research use only — not for human or veterinary use.
            </span>
          </label>

          {formError && (
            <p className="mt-4 rounded-xl bg-flame-soft px-4 py-3 text-sm text-flame-deep animate-fade-in">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-flame to-flame-deep py-3.5 text-sm font-semibold text-white shadow-lg shadow-flame/25 transition-all hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {submitting ? "Placing order..." : `Place order · ${formatMoney(totalCents)}`}
          </button>
          <p className="mt-3 text-center text-[11px] text-faint">
            You&apos;ll receive manual payment instructions on the next page.
          </p>
        </div>
      </aside>
    </form>
  );
}
