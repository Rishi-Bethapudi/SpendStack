import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';

/**
 * Guards every authenticated route and resolves the identity the shell needs.
 * This runs alongside the existing proxy/middleware rather than replacing it —
 * the middleware refreshes the session, this checks it at render time.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // The profiles row is the source of truth for display name; email is owned
  // by Supabase Auth and is read from the user object, never from profiles.
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <AppShell
      userEmail={user.email ?? ''}
      displayName={profile?.display_name ?? null}
    >
      {children}
    </AppShell>
  );
}
