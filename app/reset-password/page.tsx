import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard
        title="Invalid reset link"
        subtitle="This link is missing its reset token. Request a new one below."
      >
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="inline-block rounded-full border-2 border-aqua px-6 py-3 text-sm font-semibold text-aqua-deep transition-colors hover:bg-aqua-soft"
          >
            Request a new link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      subtitle="Choose a strong password for your account."
    >
      <ResetForm token={token} />
    </AuthCard>
  );
}
