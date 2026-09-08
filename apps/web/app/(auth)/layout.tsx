import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Anyone already signed in has no reason to be on login or signup.
 * The proxy/middleware already guards the authenticated routes; this handles
 * the reverse direction.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
