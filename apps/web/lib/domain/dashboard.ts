import type { CurrencyCode } from '@spendstack/utils';
import type { AccountType } from './account-types';
import type { TransactionType } from './transaction-types';

/**
 * View models for the dashboard.
 *
 * These are presentation shapes, not database rows. The query layer maps
 * Supabase rows (typed via @spendstack/types) into these, which keeps the
 * dashboard components free of database implementation detail and lets the
 * Expo app reuse the same shapes later.
 */

export interface MoneyValue {
  amount: number;
  currency: CurrencyCode;
}

export interface NetPositionView {
  net: MoneyValue;
  assets: MoneyValue;
  liabilities: MoneyValue;
  /** Change over the selected period. Null when there is no prior data. */
  change: MoneyValue | null;
  /**
   * Currencies held that are not the display currency. Surfaced as a note
   * rather than silently converted — no exchange rate source exists yet.
   */
  excludedCurrencies: CurrencyCode[];
}

export interface CashFlowPoint {
  /** ISO date for the start of the bucket. */
  date: string;
  income: number;
  expenses: number;
}

export interface CashFlowView {
  currency: CurrencyCode;
  income: number;
  expenses: number;
  net: number;
  series: CashFlowPoint[];
}

export interface AccountBalanceView {
  id: string;
  name: string;
  accountType: AccountType;
  currency: CurrencyCode;
  balance: number;
}

export interface CategorySpendView {
  categoryId: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  /** Share of total spending in the period, 0–1. */
  share: number;
}

export interface TransactionSummaryView {
  id: string;
  date: string;
  description: string;
  transactionType: TransactionType;
  /** Signed effect on the account balance. */
  amount: number;
  currency: CurrencyCode;
  accountName: string;
  categoryName: string | null;
  merchantName: string | null;
  /** True when the header has more than one entry. */
  isSplit: boolean;
}

export interface BudgetSummaryView {
  id: string;
  name: string;
  currency: CurrencyCode;
  allocated: number;
  spent: number;
}

export interface GoalSummaryView {
  id: string;
  name: string;
  currency: CurrencyCode;
  target: number;
  current: number;
  targetDate: string | null;
}

export interface UpcomingRecurringView {
  id: string;
  name: string;
  transactionType: TransactionType;
  amount: number;
  currency: CurrencyCode;
  nextOccurrence: string;
  accountName: string;
}

export interface DashboardData {
  /** The user's preferred display currency. */
  displayCurrency: CurrencyCode;
  netPosition: NetPositionView;
  cashFlow: CashFlowView;
  accounts: AccountBalanceView[];
  spendingByCategory: CategorySpendView[];
  recentTransactions: TransactionSummaryView[];
  budgets: BudgetSummaryView[];
  goals: GoalSummaryView[];
  upcomingRecurring: UpcomingRecurringView[];
}

/** True when the user has never recorded anything — drives the empty state. */
export function isDashboardEmpty(data: DashboardData): boolean {
  return (
    data.accounts.length === 0 &&
    data.recentTransactions.length === 0 &&
    data.budgets.length === 0 &&
    data.goals.length === 0
  );
}
