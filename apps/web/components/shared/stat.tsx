import { cn } from '@/lib/utils';

interface StatProps {
  label: string;
  /** The figure. Pass a <Money /> element rather than a formatted string. */
  value: React.ReactNode;
  /** Context under the figure: a comparison, a count, a date. */
  meta?: React.ReactNode;
  className?: string;
}

/**
 * A label and a figure. The label is sentence case, not tracked-out caps —
 * caps labels read as chrome and slow scanning of the number itself.
 */
export function Stat({ label, value, meta, className }: StatProps) {
  return (
    <div className={cn('min-w-0 space-y-1', className)}>
      <p className="text-xs font-normal text-muted-foreground">{label}</p>
      <div className="truncate">{value}</div>
      {meta ? <div className="text-xs text-muted-foreground">{meta}</div> : null}
    </div>
  );
}

/** Evenly divided row of stats, stacking to two columns on small screens. */
export function StatRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
