import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your account email and we'll send you a reset link. It expires in 1 hour."
    >
      <ForgotForm />
    </AuthCard>
  );
}
