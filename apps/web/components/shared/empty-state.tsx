import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  /** What the user can do, in one sentence. An empty screen invites action. */
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  /** `inline` sits inside a section; `page` fills a whole route. */
  variant?: 'inline' | 'page';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'inline',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'page' ? 'gap-4 px-6 py-20' : 'gap-3 px-4 py-12',
        className,
      )}
    >
      {Icon ? (
        <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <p
          className={cn(
            'font-medium text-foreground',
            variant === 'page' ? 'text-lg' : 'text-sm',
          )}
        >
          {title}
        </p>
        {description ? (
          <p className="mx-auto max-w-sm text-pretty text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {action || secondaryAction ? (
        <div className="mt-1 flex flex-col items-center gap-2 sm:flex-row">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
