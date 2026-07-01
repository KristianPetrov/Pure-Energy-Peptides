import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section>
        <h2>1. Information we collect</h2>
        <p>
          We collect the information you provide when creating an account or
          placing an order: name, email address, phone number (optional), and
          shipping address. We also store order history and, if you create an
          account, a securely hashed password.
        </p>
      </section>
      <section>
        <h2>2. How we use information</h2>
        <ul>
          <li>To process and fulfill orders and send order updates.</li>
          <li>To operate customer accounts and authentication.</li>
          <li>To respond to support requests.</li>
          <li>To meet legal and record-keeping obligations.</li>
        </ul>
      </section>
      <section>
        <h2>3. What we do not do</h2>
        <p>
          We do not sell your personal information. We do not store payment
          credentials; payments are made directly through Zelle or Venmo.
        </p>
      </section>
      <section>
        <h2>4. Cookies and local storage</h2>
        <p>
          We use browser local storage to persist your shopping cart and
          session cookies to keep you signed in. We do not use third-party
          advertising trackers.
        </p>
      </section>
      <section>
        <h2>5. Data retention and your rights</h2>
        <p>
          Order records are retained for business and legal purposes. You may
          request access to or deletion of your account data by contacting
          support; we will honor requests to the extent permitted by law.
        </p>
      </section>
      <section>
        <h2>6. Contact</h2>
        <p>
          Questions about this policy can be directed to {BRAND_NAME} support
          via the contact details in your order emails.
        </p>
      </section>
    </LegalPage>
  );
}
