import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';

export const metadata: Metadata = {
  title: 'Reset your password',
};

/**
 * ── BACKEND INTEGRATION POINT ──────────────────────────────────────────────
 * The route and layout exist so links do not dead-end, but the reset flow is
 * not wired to supabase.auth.resetPasswordForEmail yet. Rather than render a
 * form that silently does nothing, this states the position plainly.
 *
 * To finish it: add a resetPassword action beside the login action, a
 * resetPasswordSchema in packages/validation/src/auth.ts, then reuse
 * <FormField /> and <SubmitButton /> exactly as LoginForm does.
 */
export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Password resets are not available yet."
      footer={
        <Link
          href="/login"
          className="rounded font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <p className="text-pretty text-sm text-muted-foreground">
        This is coming shortly. In the meantime, contact support to regain access
        to your account.
      </p>
    </AuthShell>
  );
}
