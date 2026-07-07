import type { Metadata } from "next";
import {
  Beaker,
  FileCheck2,
  Microscope,
  Snowflake,
  Thermometer,
  Workflow,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Science & Quality",
  description:
    "Our quality standards: HPLC/MS verification, lyophilization, and lot traceability.",
  alternates: { canonical: "/science" },
};

const STANDARDS = [
  {
    icon: Microscope,
    title: "HPLC verification",
    body: "Every production lot is analyzed by high-performance liquid chromatography to confirm identity and purity before release.",
  },
  {
    icon: Beaker,
    title: "Mass spectrometry",
    body: "Molecular weight is confirmed by MS analysis, ensuring each vial contains exactly the compound described on its label.",
  },
  {
    icon: Snowflake,
    title: "Lyophilization",
    body: "Compounds are freeze-dried into a stable lyophilized powder, preserving structural integrity during storage and transit.",
  },
  {
    icon: FileCheck2,
    title: "Lot traceability",
    body: "Each vial is tied to a documented lot with analysis records available, so research results remain reproducible.",
  },
  {
    icon: Thermometer,
    title: "Controlled handling",
    body: "Materials are stored and packed under temperature-aware conditions appropriate for peptide stability.",
  },
  {
    icon: Workflow,
    title: "Process discipline",
    body: "Sourcing, verification, storage, and fulfillment follow a documented process from intake to dispatch.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Sourcing",
    body: "Compounds are sourced from qualified synthesis partners against defined specifications.",
  },
  {
    step: "02",
    title: "Verification",
    body: "Independent HPLC and MS analysis confirms identity and purity for each lot.",
  },
  {
    step: "03",
    title: "Stabilization",
    body: "Verified material is lyophilized and sealed in research-grade vials.",
  },
  {
    step: "04",
    title: "Fulfillment",
    body: "Orders are packed with lot documentation and dispatched with tracking.",
  },
];

export default function SciencePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <Reveal>
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">
            Science &amp; <span className="text-gradient-brand">quality</span>
          </h1>
          <p className="mt-4 leading-relaxed text-slate-ui">
            Research is only as good as its reference materials. Our standards
            exist so qualified researchers can trust what is inside every vial
            — verified identity, verified purity, and complete documentation.
          </p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STANDARDS.map((standard, index) => (
          <Reveal key={standard.title} delay={(index % 3) * 90}>
            <div className="card-lift h-full rounded-2xl border border-silver bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-aqua-soft text-aqua-deep">
                <standard.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h2 className="font-semibold text-ink">{standard.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-ui">
                {standard.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <section className="mt-24">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight">
            From synthesis to your lab
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {PROCESS.map((phase, index) => (
            <Reveal key={phase.step} delay={index * 110}>
              <div className="iridescent relative h-full rounded-2xl border border-silver p-6">
                <span className="text-3xl font-bold text-gradient-brand">
                  {phase.step}
                </span>
                <h3 className="mt-3 font-semibold text-ink">{phase.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-ui">
                  {phase.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
