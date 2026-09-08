'use client';

import { AlertCircle, Lock, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ErrorKind = 'generic' | 'network' | 'permission' | 'notFound';

interface ErrorStateProps {
  kind?: ErrorKind;
  title?: string;
  description?: string;
  onRetry?: () => void;
  variant?: 'inline' | 'page';
  className?: string;
}

/**
 * Copy explains what happened and what to do next. Raw Supabase or Postgres
 * error text is never surfaced — it leaks schema detail and helps nobody.
 */
const PRESETS: Record<ErrorKind, { title: string; description: string; icon: typeof AlertCircle }> = {
  generic: {
    title: 'This section could not load',
    description: 'Something went wrong on our end. Try again in a moment.',
    icon: AlertCircle,
  },
  network: {
    title: 'No connection',
    description: 'Check your internet connection, then try again.',
    icon: WifiOff,
  },
  permission: {
    title: 'You do not have access to this',
    description: 'This data belongs to another account. Sign in with the account that owns it.',
    icon: Lock,
  },
  notFound: {
    title: 'Not found',
    description: 'This record may have been deleted or the link may be out of date.',
    icon: AlertCircle,
  },
};

export function ErrorState({
  kind = 'generic',
  title,
  description,
  onRetry,
  variant = 'inline',
  className,
}: ErrorStateProps) {
  const preset = PRESETS[kind];
  const Icon = preset.icon;

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        variant === 'page' ? 'px-6 py-20' : 'px-4 py-12',
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-danger-subtle text-danger">
        <Icon className="size-5" aria-hidden="true" />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">{title ?? preset.title}</p>
        <p className="mx-auto max-w-sm text-pretty text-sm text-muted-foreground">
          {description ?? preset.description}
        </p>
      </div>

      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
