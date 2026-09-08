import {
  Banknote,
  CreditCard,
  Landmark,
  LineChart,
  PiggyBank,
  Receipt,
  Wallet,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

/**
 * Presentation metadata for account_type.
 *
 * NOTE: the database column is `account_type`, not `type`. The keys below are
 * the exact stored enum values and must not be renamed for display purposes.
 */
export const ACCOUNT_TYPES = [
  'cash',
  'bank',
  'credit_card',
  'debit_card',
  'savings',
  'investment',
  'wallet',
  'loan',
  'other',
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export interface AccountTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Description shown beside the option in the account form. */
  hint: string;
  /**
   * True where a negative balance is the normal state. The UI uses this to
   * label the figure "owed" rather than flagging it as a problem.
   */
  liability: boolean;
}

export const ACCOUNT_TYPE_META: Record<AccountType, AccountTypeMeta> = {
  cash: {
    label: 'Cash',
    icon: Banknote,
    hint: 'Notes and coins you hold yourself',
    liability: false,
  },
  bank: {
    label: 'Bank account',
    icon: Landmark,
    hint: 'A current or chequing account',
    liability: false,
  },
  credit_card: {
    label: 'Credit card',
    icon: CreditCard,
    hint: 'A balance you owe and repay',
    liability: true,
  },
  debit_card: {
    label: 'Debit card',
    icon: WalletCards,
    hint: 'A card drawing on an existing balance',
    liability: false,
  },
  savings: {
    label: 'Savings',
    icon: PiggyBank,
    hint: 'Money set aside, separate from daily spending',
    liability: false,
  },
  investment: {
    label: 'Investment',
    icon: LineChart,
    hint: 'Brokerage, funds or retirement holdings',
    liability: false,
  },
  wallet: {
    label: 'Wallet',
    icon: Wallet,
    hint: 'A digital or prepaid balance',
    liability: false,
  },
  loan: {
    label: 'Loan',
    icon: Receipt,
    hint: 'An outstanding amount you repay over time',
    liability: true,
  },
  other: {
    label: 'Other',
    icon: Wallet,
    hint: 'Anything that does not fit the categories above',
    liability: false,
  },
};

export function accountTypeMeta(value: string): AccountTypeMeta {
  return ACCOUNT_TYPE_META[value as AccountType] ?? ACCOUNT_TYPE_META.other;
}

export function accountTypeLabel(value: string): string {
  return accountTypeMeta(value).label;
}

export function isLiabilityAccount(value: string): boolean {
  return accountTypeMeta(value).liability;
}

/** Options for selects, ordered as listed above rather than alphabetically. */
export const ACCOUNT_TYPE_OPTIONS = ACCOUNT_TYPES.map((value) => ({
  value,
  ...ACCOUNT_TYPE_META[value],
}));
