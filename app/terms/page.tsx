import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Sale",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Sale">
      <section>
        <h2>1. Agreement</h2>
        <p>
          These terms govern all purchases from {BRAND_NAME}. By placing an
          order, you agree to these terms, our Research Use Only policy, and
          our privacy policy.
        </p>
      </section>
      <section>
        <h2>2. Orders and payment</h2>
        <p>
          Orders are created with a pending-payment status. Payment is made
          manually via Zelle or Venmo using the instructions shown after
          checkout; include your order reference in the payment note. Orders
          are processed once payment is verified. Unpaid orders may be
          cancelled after a reasonable period.
        </p>
      </section>
      <section>
        <h2>3. Pricing and availability</h2>
        <p>
          Prices and inventory are set at the time of order creation from our
          live catalog. We reserve the right to correct pricing errors and to
          limit quantities.
        </p>
      </section>
      <section>
        <h2>4. Shipping</h2>
        <p>
          Orders ship after payment confirmation using the shipping method
          selected at checkout. Tracking information is provided when
          available. Risk of loss passes to the purchaser upon delivery to the
          carrier.
        </p>
      </section>
      <section>
        <h2>5. Returns</h2>
        <p>
          Due to the nature of research materials, all sales are final. If an
          order arrives damaged or incorrect, contact support within 7 days of
          delivery.
        </p>
      </section>
      <section>
        <h2>6. Limitation of liability</h2>
        <p>
          Products are supplied for Research Use Only. To the maximum extent
          permitted by law, {BRAND_NAME} is not liable for any damages arising
          from misuse of products, and total liability is limited to the
          purchase price of the order.
        </p>
      </section>
    </LegalPage>
  );
}
