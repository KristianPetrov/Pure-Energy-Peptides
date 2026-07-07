import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Research Use Only Policy",
  description: `${BRAND_NAME} compliance policy: all products are strictly for in-vitro laboratory research and development. Not for human or veterinary use.`,
  alternates: { canonical: "/compliance" },
};

export default function CompliancePage() {
  return (
    <LegalPage title="Research Use Only Policy">
      <section>
        <h2>1. Scope of products</h2>
        <p>
          All products sold by {BRAND_NAME} are chemical reference materials
          intended strictly for in-vitro laboratory research and development.
          They are not drugs, foods, dietary supplements, cosmetics, or medical
          devices, and they have not been evaluated or approved by the FDA or
          any other regulatory agency for any use.
        </p>
      </section>
      <section>
        <h2>2. Prohibited uses</h2>
        <p>Products may not be used for:</p>
        <ul>
          <li>Human consumption, administration, or application of any kind.</li>
          <li>Veterinary use or administration to any animal.</li>
          <li>Diagnostic, therapeutic, or clinical purposes.</li>
          <li>Incorporation into foods, supplements, cosmetics, or drugs.</li>
          <li>Resale for any of the above purposes.</li>
        </ul>
      </section>
      <section>
        <h2>3. Purchaser qualifications</h2>
        <p>
          By ordering, you represent that you are a qualified researcher or are
          purchasing on behalf of a laboratory, institution, or organization
          equipped to handle research chemicals safely, and that you will use
          the products in compliance with all applicable laws and regulations.
        </p>
      </section>
      <section>
        <h2>4. No medical claims</h2>
        <p>
          Product descriptions reference published preclinical research for
          scientific context only. Nothing on this site constitutes medical
          advice, dosing guidance, or a claim that any product can diagnose,
          treat, cure, or prevent any disease or condition.
        </p>
      </section>
      <section>
        <h2>5. Acknowledgement at checkout</h2>
        <p>
          Every order requires an affirmative acknowledgement that the
          purchaser is a qualified researcher and that products will be used
          for Research Use Only. Orders without this acknowledgement cannot be
          placed.
        </p>
      </section>
      <section>
        <h2>6. Enforcement</h2>
        <p>
          We reserve the right to refuse or cancel any order where we have
          reason to believe products may be used contrary to this policy.
        </p>
      </section>
    </LegalPage>
  );
}
