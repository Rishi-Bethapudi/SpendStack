'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { initialSignupState, signupAction } from './actions';

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialSignupState,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create your SpendStack account</h1>

        <p className="mt-2 text-sm text-gray-600">
          Start managing your finances in one place.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            Confirm password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="Enter your password again"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="text-sm text-green-600" role="status">
            Account created successfully.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-black underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
