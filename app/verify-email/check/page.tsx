import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth-card";
import { ResendForm } from "./resend-form";

export const metadata: Metadata = {
  title: "Check your email",
};

export default async function VerifyEmailCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthCard
      title="Check your email"
      subtitle="We sent a verification link to your inbox. Click it to activate your account — the link expires in 24 hours."
    >
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-aqua-soft animate-float">
          <MailCheck className="h-7 w-7 text-aqua-deep" strokeWidth={1.6} />
        </div>
      </div>
      <ResendForm initialEmail={email} />
    </AuthCard>
  );
}
