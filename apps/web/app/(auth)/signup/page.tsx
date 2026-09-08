import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Create an account',
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Track accounts, spending and goals in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href="/login"
            className="rounded font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
