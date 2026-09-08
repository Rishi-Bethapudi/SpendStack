import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartFrameProps {
  /** True when there is genuinely nothing to plot for the period. */
  isEmpty: boolean;
  emptyMessage: string;
  height?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps every chart so an empty dataset renders a sentence instead of a
 * broken axis. Recharts will happily draw an axis with no ticks; this stops
 * that reaching the page.
 */
export function ChartFrame({
  isEmpty,
  emptyMessage,
  height = 240,
  children,
  className,
}: ChartFrameProps) {
  if (isEmpty) {
    return (
      <div style={{ minHeight: height }} className={cn('flex items-center justify-center', className)}>
        <EmptyState title={emptyMessage} />
      </div>
    );
  }

  return (
    <div style={{ height }} className={cn('w-full', className)}>
      {children}
    </div>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return <Skeleton style={{ height }} className="w-full rounded-md" />;
}
