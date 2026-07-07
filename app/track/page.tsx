import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { TrackForm } from "./track-form";

export const metadata: Metadata = {
  title: "Track Order",
  description:
    "Track the status of your research peptide order using your order reference and email address.",
  alternates: { canonical: "/track" },
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Reveal>
        <h1 className="text-3xl font-bold tracking-tight">
          Track your <span className="text-gradient-brand">order</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-ui">
          Enter your order reference and the email you used at checkout to view
          payment status, fulfillment progress, and tracking details.
        </p>
      </Reveal>
      <Reveal delay={120}>
        <div className="iridescent-border mt-8 rounded-2xl p-6">
          <TrackForm initialReference={reference} />
        </div>
      </Reveal>
    </div>
  );
}
