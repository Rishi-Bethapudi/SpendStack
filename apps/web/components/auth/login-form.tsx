'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signIn } from '@/app/(auth)/login/actions';
import { initialAuthFormState, type AuthFormState } from '@/lib/auth/form-state';
import { FormField } from './form-field';
import { FormError } from './form-error';
import { SubmitButton } from './submit-button';

/**
 * ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
 * Expects `signIn` in app/(auth)/login/actions.ts to have the signature
 * (prevState: AuthFormState, formData: FormData) => Promise<AuthFormState>,
 * returning field errors from the shared Zod schema on failure and
 * redirecting on success. Server-side validation remains authoritative; the
 * browser-side attributes below only shorten the feedback loop.
 */
export function LoginForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    signIn,
    initialAuthFormState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError message={state.message} />

      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        errors={state.fieldErrors.email}
      />

      <div className="space-y-1.5">
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          errors={state.fieldErrors.password}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="rounded text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
