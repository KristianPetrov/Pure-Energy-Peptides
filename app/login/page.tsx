import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; reset?: string }>;
}) {
  const { redirectTo, reset } = await searchParams;

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to view your orders and check out faster."
    >
      {reset && (
        <p className="mb-5 rounded-xl bg-aqua-soft px-4 py-3 text-sm text-aqua-deep">
          Your password has been reset. Sign in with your new password.
        </p>
      )}
      <LoginForm redirectTo={redirectTo} />
    </AuthCard>
  );
}
