import { getReferralPartnersWithCodes } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { StatCard } from "@/components/stat-card";
import { ReferralManager } from "./referral-manager";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const partners = await getReferralPartnersWithCodes();

  const allCodes = partners.flatMap((partner) => partner.codes);
  const activeCodes = allCodes.filter((code) => code.active).length;
  const referredOrders = allCodes.reduce(
    (sum, code) => sum + code.confirmedOrders,
    0
  );
  const referredRevenue = allCodes.reduce(
    (sum, code) => sum + code.confirmedRevenueCents,
    0
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Partners" value={String(partners.length)} />
        <StatCard label="Active codes" value={String(activeCodes)} />
        <StatCard label="Referred orders" value={String(referredOrders)} hint="Confirmed only" />
        <StatCard label="Referred revenue" value={formatMoney(referredRevenue)} />
      </div>
      <div className="mt-8">
        <ReferralManager
          partners={partners.map((partner) => ({
            ...partner,
            createdAt: partner.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
