"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import {
  resendVerificationEmail,
  type AuthFormState,
} from "@/app/actions/auth";
import { authButtonClass, authInputClass } from "@/components/auth-card";

export function ResendForm({ initialEmail }: { initialEmail?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    resendVerificationEmail,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={initialEmail}
          required
          className={authInputClass}
        />
      </div>
      {state.success && (
        <p className="rounded-xl bg-aqua-soft px-4 py-3 text-sm text-aqua-deep animate-fade-in">
          {state.success}
        </p>
      )}
      <button type="submit" disabled={pending} className={authButtonClass}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Sending..." : "Resend verification email"}
      </button>
    </form>
  );
}
