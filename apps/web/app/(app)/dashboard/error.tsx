'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/error-state';

/**
 * Route-level boundary. The raw error goes to the console for debugging and
 * never to the page — Postgres and Supabase messages leak schema detail.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard failed to load:', error);
  }, [error]);

  const permission = /permission|policy|row-level/i.test(error.message);

  return (
    <ErrorState
      variant="page"
      kind={permission ? 'permission' : 'generic'}
      title={permission ? undefined : 'Your dashboard could not load'}
      onRetry={reset}
    />
  );
}
