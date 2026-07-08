"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import {
  requestPasswordReset,
  type AuthFormState,
} from "@/app/actions/auth";
import { authButtonClass, authInputClass } from "@/components/auth-card";

export function ForgotForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
      {state.success && (
        <p className="rounded-xl bg-aqua-soft px-4 py-3 text-sm text-aqua-deep animate-fade-in">
          {state.success}
        </p>
      )}
      <button type="submit" disabled={pending} className={authButtonClass}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
