import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/app/actions/auth";
import { AuthCard } from "@/components/auth-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let ok = false;
  if (token) {
    const result = await verifyEmailToken(token).catch(() => ({ ok: false }));
    ok = result.ok;
  }

  return (
    <AuthCard title={ok ? "Email verified" : "Verification failed"}>
      <div className="flex flex-col items-center gap-4 text-center">
        {ok ? (
          <>
            <CheckCircle2 className="h-12 w-12 text-aqua" strokeWidth={1.5} />
            <p className="text-sm leading-relaxed text-slate-ui">
              Your email has been verified. You can now sign in to your
              account.
            </p>
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-flame to-flame-deep px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-flame" strokeWidth={1.5} />
            <p className="text-sm leading-relaxed text-slate-ui">
              This verification link is invalid or has expired. Request a new
              one below.
            </p>
            <Link
              href="/verify-email/check"
              className="rounded-full border-2 border-aqua px-6 py-3 text-sm font-semibold text-aqua-deep transition-colors hover:bg-aqua-soft"
            >
              Resend verification email
            </Link>
          </>
        )}
      </div>
    </AuthCard>
  );
}
