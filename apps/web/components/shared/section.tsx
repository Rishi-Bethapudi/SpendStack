import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  description?: string;
  /** Right-aligned control: a filter, a period selector, a small button. */
  action?: React.ReactNode;
  /** Renders a quiet "see all" link in the header. */
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
  className?: string;
  /** Removes body padding so tables and lists can reach the section edge. */
  flush?: boolean;
}

/**
 * The one container in the app. A hairline border and no shadow — elevation
 * is reserved for overlays, so a section never appears to float.
 */
export function Section({
  title,
  description,
  action,
  href,
  hrefLabel = 'See all',
  children,
  className,
  flush = false,
}: SectionProps) {
  return (
    <section
      className={cn(
        'flex flex-col overflow-hidden rounded-lg border border-border bg-surface',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0 space-y-0.5">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {action}
          {href ? (
            <Link
              href={href}
              className="inline-flex items-center gap-0.5 rounded-md text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {hrefLabel}
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </header>

      <div className={cn('flex-1', flush ? '' : 'p-4 sm:p-5')}>{children}</div>
    </section>
  );
}

/** Divider-separated rows inside a flush Section. */
export function SectionList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <ul className={cn('divide-y divide-border', className)}>{children}</ul>;
}
