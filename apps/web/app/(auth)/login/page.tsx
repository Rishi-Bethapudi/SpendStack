'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { initialLoginState, loginAction } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginState,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Log in to SpendStack</h1>

        <p className="mt-2 text-sm text-gray-600">
          Access your personal finance dashboard.
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
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-md border px-3 py-2"
            placeholder="Your password"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="text-sm text-green-600" role="status">
            Login successful.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/signup" className="font-medium text-black underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
