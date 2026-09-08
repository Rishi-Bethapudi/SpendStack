import { cn } from '@/lib/utils';
import { formatMoney, type CurrencyCode } from '@spendstack/utils';

type FlowRole = 'debit' | 'credit' | 'neutral' | 'auto';
type FigureSize = 'inherit' | 'sm' | 'md' | 'lg' | 'xl';

interface MoneyProps {
  amount: number;
  currency: CurrencyCode;
  /**
   * Which financial direction this figure represents. `auto` derives it from
   * the sign. `neutral` is correct for transfers, where nothing is gained or
   * lost overall.
   */
  role?: FlowRole;
  size?: FigureSize;
  /** Render an explicit + or -. Off for standalone balances. */
  signed?: boolean;
  /** Drop minor units. Use only for chart axes and dense summaries. */
  compact?: boolean;
  /**
   * Text read only by screen readers, placed before the figure. Colour and
   * sign carry direction visually; this carries it non-visually.
   */
  srPrefix?: string;
  locale?: string;
  className?: string;
}

const SIZE_CLASS: Record<FigureSize, string> = {
  inherit: '',
  sm: 'text-figure-sm font-medium',
  md: 'text-figure font-medium tracking-tight',
  lg: 'text-figure-lg font-semibold tracking-tight',
  xl: 'text-figure-xl font-semibold tracking-tight',
};

const ROLE_CLASS: Record<Exclude<FlowRole, 'auto'>, string> = {
  debit: 'text-debit',
  credit: 'text-credit',
  neutral: 'text-foreground',
};

function resolveRole(role: FlowRole, amount: number): keyof typeof ROLE_CLASS {
  if (role !== 'auto') return role;
  if (amount > 0) return 'credit';
  if (amount < 0) return 'debit';
  return 'neutral';
}

/**
 * The single place a monetary figure is rendered. Always tabular so digits
 * align down a column, always currency-aware, never hard-coded to one symbol.
 */
export function Money({
  amount,
  currency,
  role = 'neutral',
  size = 'inherit',
  signed = false,
  compact = false,
  srPrefix,
  locale,
  className,
}: MoneyProps) {
  const resolved = resolveRole(role, amount);
  const text = formatMoney(amount, currency, { locale, signed, compact });

  return (
    <span
      className={cn('tnum whitespace-nowrap', SIZE_CLASS[size], ROLE_CLASS[resolved], className)}
    >
      {srPrefix ? <span className="sr-only">{srPrefix} </span> : null}
      {text}
    </span>
  );
}

/**
 * A balance shown against a liability account. The stored amount stays
 * negative; the label explains what the figure means instead of relying on
 * the minus sign alone.
 */
export function LiabilityBalance({
  amount,
  currency,
  size = 'inherit',
  locale,
  className,
}: Pick<MoneyProps, 'amount' | 'currency' | 'size' | 'locale' | 'className'>) {
  const owed = Math.abs(amount);
  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      <Money
        amount={owed}
        currency={currency}
        role={owed > 0 ? 'debit' : 'neutral'}
        size={size}
        locale={locale}
      />
      <span className="text-xs text-muted-foreground">owed</span>
    </span>
  );
}
