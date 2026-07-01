import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Track orders, reorder faster, and manage your research supply in one place."
    >
      <RegisterForm />
    </AuthCard>
  );
}
