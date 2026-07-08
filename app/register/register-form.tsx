"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { registerUser, type AuthFormState } from "@/app/actions/auth";
import { authButtonClass, authInputClass } from "@/components/auth-card";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    registerUser,
    {}
  );

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
            Full name
          </label>
          <input id="name" name="name" autoComplete="name" required className={authInputClass} />
        </div>
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
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
            Password
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
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-foreground">
            Confirm password
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
          {pending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-ui">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-aqua-deep hover:text-flame">
          Sign in
        </Link>
      </p>
    </div>
  );
}
