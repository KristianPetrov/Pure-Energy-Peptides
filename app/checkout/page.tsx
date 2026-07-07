import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-2 text-sm text-slate-ui">
          Orders are confirmed once your manual Zelle or Venmo payment is
          verified.
        </p>
      </Reveal>
      <div className="mt-10">
        <CheckoutForm />
      </div>
    </div>
  );
}
