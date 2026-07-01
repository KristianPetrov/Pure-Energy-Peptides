"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { resetPassword, type AuthFormState } from "@/app/actions/auth";
import { authButtonClass, authInputClass } from "@/components/auth-card";

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    resetPassword,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className={authInputClass}
        />
        <p className="mt-1.5 text-xs text-faint">
          At least 8 characters with one letter and one number.
        </p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
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
        {pending ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}
