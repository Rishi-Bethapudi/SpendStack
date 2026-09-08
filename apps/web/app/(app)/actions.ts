'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Sign out and return to the login screen. Kept here rather than in the user
 * menu so the browser bundle carries no Supabase auth calls.
 *
 * If lib/auth/auth.ts already exports signOut(), call that instead of the
 * client directly — this is written to work either way.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
