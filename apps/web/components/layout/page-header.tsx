import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  /** The single most important action. Full width on phones. */
  action?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  /** Filter bar or tabs, rendered below the title on its own row. */
  toolbar?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  secondaryActions,
  toolbar,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, index) => {
              const last = index === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {crumb.href && !last ? (
                    <Link
                      href={crumb.href}
                      className="rounded transition-colors hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current={last ? 'page' : undefined} className={cn(last && 'text-foreground')}>
                      {crumb.label}
                    </span>
                  )}
                  {!last ? (
                    <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {description ? (
            <p className="max-w-prose text-pretty text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {action || secondaryActions ? (
          <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row sm:items-center">
            {secondaryActions}
            {action}
          </div>
        ) : null}
      </div>

      {toolbar ? <div>{toolbar}</div> : null}
    </div>
  );
}
