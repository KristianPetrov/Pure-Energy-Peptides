"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  authenticate,
  resendVerificationEmail,
  type AuthFormState,
} from "@/app/actions/auth";
import { authButtonClass, authInputClass } from "@/components/auth-card";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    authenticate,
    {}
  );
  const [resendState, resendAction, resendPending] = useActionState<
    AuthFormState,
    FormData
  >(resendVerificationEmail, {});

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={authInputClass}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-aqua-deep hover:text-flame"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={authInputClass}
          />
        </div>

        {state.error && (
          <p className="rounded-xl bg-flame-soft px-4 py-3 text-sm text-flame-deep animate-fade-in">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className={authButtonClass}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {state.unverifiedEmail && (
        <form action={resendAction} className="rounded-xl border border-aqua/30 bg-aqua-soft p-4 text-center animate-fade-in">
          <input type="hidden" name="email" value={state.unverifiedEmail} />
          {resendState.success ? (
            <p className="text-sm text-aqua-deep">{resendState.success}</p>
          ) : (
            <button
              type="submit"
              disabled={resendPending}
              className="text-sm font-semibold text-aqua-deep underline-offset-2 hover:underline disabled:opacity-60"
            >
              {resendPending
                ? "Sending..."
                : "Resend the verification email"}
            </button>
          )}
        </form>
      )}

      <p className="text-center text-sm text-slate-ui">
        New to Pure Energy Peptides?{" "}
        <Link href="/register" className="font-semibold text-aqua-deep hover:text-flame">
          Create an account
        </Link>
      </p>
    </div>
  );
}
