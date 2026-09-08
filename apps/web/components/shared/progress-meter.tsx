import { formatPercent, progressWidth } from '@spendstack/utils';
import { cn } from '@/lib/utils';

export type MeterTone = 'normal' | 'caution' | 'over' | 'complete';

interface ProgressMeterProps {
  current: number;
  target: number;
  tone?: MeterTone;
  /** Accessible name, e.g. "Groceries budget used". Required. */
  label: string;
  showPercent?: boolean;
  className?: string;
}

const TONE_FILL: Record<MeterTone, string> = {
  normal: 'bg-primary',
  caution: 'bg-warning',
  over: 'bg-danger',
  complete: 'bg-credit',
};

/**
 * Derive tone from usage. Budgets and goals share this so "near limit" means
 * the same thing everywhere. Tone is paired with a text label at the call
 * site — the bar's colour is never the only signal.
 */
export function budgetTone(spent: number, allocated: number): MeterTone {
  if (allocated <= 0) return 'normal';
  const used = spent / allocated;
  if (used > 1) return 'over';
  if (used >= 0.9) return 'caution';
  return 'normal';
}

export function goalTone(current: number, target: number): MeterTone {
  if (target <= 0) return 'normal';
  return current >= target ? 'complete' : 'normal';
}

export function ProgressMeter({
  current,
  target,
  tone = 'normal',
  label,
  showPercent = false,
  className,
}: ProgressMeterProps) {
  const fraction = progressWidth(current, target);
  const percent = Math.round(fraction * 100);

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 w-full overflow-hidden rounded-pill bg-muted"
      >
        <div
          className={cn('h-full rounded-pill transition-[width] duration-500', TONE_FILL[tone])}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      {showPercent ? (
        <span className="tnum shrink-0 text-xs text-muted-foreground">
          {formatPercent(target > 0 ? current / target : 0)}
        </span>
      ) : null}
    </div>
  );
}
