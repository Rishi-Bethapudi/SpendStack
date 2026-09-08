'use client';

import { useActionState } from 'react';
import { MailCheck } from 'lucide-react';
import { signUp } from '@/app/(auth)/signup/actions';
import { initialAuthFormState, type AuthFormState } from '@/lib/auth/form-state';
import { FormField } from './form-field';
import { FormError } from './form-error';
import { SubmitButton } from './submit-button';

/**
 * ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
 * Expects `signUp` in app/(auth)/signup/actions.ts with the signature
 * (prevState: AuthFormState, formData: FormData) => Promise<AuthFormState>.
 *
 * Where the Supabase project requires email confirmation, return
 * { status: 'email_confirmation_required' } instead of redirecting, and the
 * confirmation panel below is shown.
 */
export function SignupForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    signUp,
    initialAuthFormState,
  );

  if (state.status === 'email_confirmation_required') {
    return (
      <div className="space-y-3 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-credit-subtle text-credit">
          <MailCheck className="size-5" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Confirm your email</p>
          <p className="text-pretty text-sm text-muted-foreground">
            We sent a confirmation link to your inbox. Open it to finish setting up
            your account.
          </p>
        </div>
      </div>
    );
  }

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

      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters."
        errors={state.fieldErrors.password}
      />

      <FormField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors.confirmPassword}
      />

      <SubmitButton pendingLabel="Creating account…">Create account</SubmitButton>
    </form>
  );
}
