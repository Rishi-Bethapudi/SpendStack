import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  RotateCcw,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

/**
 * Presentation metadata for transaction type. Keys are the stored enum values.
 *
 * Direction is deliberately not encoded as "colour = meaning". Every type
 * carries an icon, a label and a sign so the type survives greyscale printing
 * and colour-vision deficiency.
 */
export const TRANSACTION_TYPES = [
  'expense',
  'income',
  'transfer',
  'refund',
  'adjustment',
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

/** How the amount affects the balance, for sign and colour role selection. */
export type FlowDirection = 'debit' | 'credit' | 'neutral' | 'signed';

export interface TransactionTypeMeta {
  label: string;
  icon: LucideIcon;
  direction: FlowDirection;
  /** Read out by screen readers alongside the amount. */
  srLabel: string;
  hint: string;
}

export const TRANSACTION_TYPE_META: Record<TransactionType, TransactionTypeMeta> = {
  expense: {
    label: 'Expense',
    icon: ArrowUpRight,
    direction: 'debit',
    srLabel: 'Money out',
    hint: 'Money leaving an account',
  },
  income: {
    label: 'Income',
    icon: ArrowDownLeft,
    direction: 'credit',
    srLabel: 'Money in',
    hint: 'Money arriving in an account',
  },
  transfer: {
    label: 'Transfer',
    icon: ArrowLeftRight,
    direction: 'neutral',
    srLabel: 'Moved between accounts',
    hint: 'Moving money between your own accounts',
  },
  refund: {
    label: 'Refund',
    icon: RotateCcw,
    direction: 'credit',
    srLabel: 'Money returned',
    hint: 'Money returned against an earlier expense',
  },
  adjustment: {
    label: 'Adjustment',
    icon: SlidersHorizontal,
    direction: 'signed',
    srLabel: 'Balance correction',
    hint: 'A correction to bring a balance in line with reality',
  },
};

export function transactionTypeMeta(value: string): TransactionTypeMeta {
  return (
    TRANSACTION_TYPE_META[value as TransactionType] ??
    TRANSACTION_TYPE_META.adjustment
  );
}

export function transactionTypeLabel(value: string): string {
  return transactionTypeMeta(value).label;
}

/**
 * Resolve the colour role for an amount. An adjustment takes its direction
 * from the sign of the amount itself; a transfer is always neutral because
 * net worth is unchanged.
 */
export function flowRoleFor(
  type: string,
  amount: number,
): 'debit' | 'credit' | 'neutral' {
  const { direction } = transactionTypeMeta(type);
  if (direction === 'signed') {
    if (amount > 0) return 'credit';
    if (amount < 0) return 'debit';
    return 'neutral';
  }
  return direction;
}

export const TRANSACTION_TYPE_OPTIONS = TRANSACTION_TYPES.map((value) => ({
  value,
  ...TRANSACTION_TYPE_META[value],
}));
