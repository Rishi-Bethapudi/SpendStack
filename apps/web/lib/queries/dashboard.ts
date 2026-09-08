import 'server-only';

import {
  resolvePeriod,
  type CurrencyCode,
  type PeriodKey,
} from '@spendstack/utils';
import { createClient } from '@/lib/supabase/server';
import type { DashboardData } from '@/lib/domain/dashboard';

const ASSET_ACCOUNT_TYPES = new Set([
  'cash',
  'bank',
  'debit_card',
  'savings',
  'investment',
  'wallet',
  'other',
]);

const LIABILITY_ACCOUNT_TYPES = new Set([
  'credit_card',
  'loan',
]);

function getTransaction(
  entry: {
    transactions:
      | {
          transaction_date: string;
          transaction_type: string;
          description: string | null;
          merchant_id: string | null;
        }
      | {
          transaction_date: string;
          transaction_type: string;
          description: string | null;
          merchant_id: string | null;
        }[]
      | null;
  },
) {
  return Array.isArray(entry.transactions)
    ? entry.transactions[0] ?? null
    : entry.transactions;
}

export async function getDashboardData(
  period: PeriodKey,
): Promise<DashboardData> {
  const supabase = await createClient();
  const range = resolvePeriod(period);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('default_currency')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw new Error(`Failed to load profile: ${profileError.message}`);
  }

  const displayCurrency = profile.default_currency as CurrencyCode;

  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select(
      'id, name, account_type, currency, opening_balance, opening_balance_date',
    )
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('name');

  if (accountsError) {
    throw new Error(`Failed to load accounts: ${accountsError.message}`);
  }

  const { data: entries, error: entriesError } = await supabase
    .from('transaction_entries')
    .select(
      `
        account_id,
        account_amount,
        entry_type,
        currency,
        category_id,
        transaction_id,
        transactions!inner (
          transaction_date,
          transaction_type,
          description,
          merchant_id
        )
      `,
    )
    .eq('user_id', user.id);

  if (entriesError) {
    throw new Error(
      `Failed to load transaction entries: ${entriesError.message}`,
    );
  }

  const accountRows = accounts ?? [];
  const entryRows = entries ?? [];

  const accountById = new Map(
    accountRows.map((account) => [account.id, account]),
  );

  /*
   * ─────────────────────────────────────────────────────────────────────────
   * Account balances
   * ─────────────────────────────────────────────────────────────────────────
   */

  const balanceByAccount = new Map<string, number>();

  for (const account of accountRows) {
    balanceByAccount.set(account.id, Number(account.opening_balance));
  }

  const currencies = new Set<string>();

  for (const entry of entryRows) {
    const account = accountById.get(entry.account_id);

    if (!account) continue;

    currencies.add(account.currency);

    const current = balanceByAccount.get(account.id) ?? 0;
    const amount = Number(entry.account_amount);

    if (entry.entry_type === 'credit') {
      balanceByAccount.set(account.id, current + amount);
    } else if (entry.entry_type === 'debit') {
      balanceByAccount.set(account.id, current - amount);
    }
  }

  for (const account of accountRows) {
    currencies.add(account.currency);
  }

  const excludedCurrencies = [...currencies].filter(
    (currency) => currency !== displayCurrency,
  ) as CurrencyCode[];

  const accountBalances = accountRows.map((account) => ({
    id: account.id,
    name: account.name,
    accountType:
      account.account_type as DashboardData['accounts'][number]['accountType'],
    currency: account.currency as CurrencyCode,
    balance: balanceByAccount.get(account.id) ?? 0,
  }));

  /*
   * ─────────────────────────────────────────────────────────────────────────
   * Net position
   * ─────────────────────────────────────────────────────────────────────────
   */

  const displayAccounts = accountBalances.filter(
    (account) => account.currency === displayCurrency,
  );

  let assets = 0;
  let liabilities = 0;

  for (const account of displayAccounts) {
    if (LIABILITY_ACCOUNT_TYPES.has(account.accountType)) {
      liabilities += account.balance;
    } else if (ASSET_ACCOUNT_TYPES.has(account.accountType)) {
      assets += account.balance;
    }
  }

  const net = assets - liabilities;

  /*
   * ─────────────────────────────────────────────────────────────────────────
   * Period transactions
   * ─────────────────────────────────────────────────────────────────────────
   */

  const periodStart = range.from.getTime();
  const periodEnd = range.to.getTime();

  const periodEntries = entryRows.filter((entry) => {
    const account = accountById.get(entry.account_id);

    if (!account || account.currency !== displayCurrency) {
      return false;
    }

    const transaction = getTransaction(entry);

    if (!transaction) return false;

    const transactionTime = new Date(
      transaction.transaction_date,
    ).getTime();

    return transactionTime >= periodStart && transactionTime <= periodEnd;
  });

  /*
   * ─────────────────────────────────────────────────────────────────────────
   * Cash flow
   * ─────────────────────────────────────────────────────────────────────────
   */

  let income = 0;
  let expenses = 0;

  const cashFlowByDate = new Map<
    string,
    { income: number; expenses: number }
  >();

  for (const entry of periodEntries) {
    const transaction = getTransaction(entry);

    if (!transaction) continue;

    const amount = Number(entry.account_amount);

    if (
      transaction.transaction_type === 'income' &&
      entry.entry_type === 'credit'
    ) {
      income += amount;
    }

    if (
      transaction.transaction_type === 'expense' &&
      entry.entry_type === 'debit'
    ) {
      expenses += amount;
    }

    if (
      transaction.transaction_type === 'refund' &&
      entry.entry_type === 'credit'
    ) {
      expenses -= amount;
    }

    const date = transaction.transaction_date.slice(0, 10);

    const point = cashFlowByDate.get(date) ?? {
      income: 0,
      expenses: 0,
    };

    if (
      transaction.transaction_type === 'income' &&
      entry.entry_type === 'credit'
    ) {
      point.income += amount;
    }

    if (
      transaction.transaction_type === 'expense' &&
      entry.entry_type === 'debit'
    ) {
      point.expenses += amount;
    }

    if (
      transaction.transaction_type === 'refund' &&
      entry.entry_type === 'credit'
    ) {
      point.expenses -= amount;
    }

    cashFlowByDate.set(date, point);
  }

  const cashFlowSeries = [...cashFlowByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      income: values.income,
      expenses: values.expenses,
    }));

  /*
   * ─────────────────────────────────────────────────────────────────────────
   * Spending by category
   * ─────────────────────────────────────────────────────────────────────────
   */

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .eq('user_id', user.id);

  if (categoriesError) {
    throw new Error(
      `Failed to load categories: ${categoriesError.message}`,
    );
  }

  const categoryById = new Map(
    (categories ?? []).map((category) => [category.id, category.name]),
  );

  const spendingByCategoryMap = new Map<string, number>();

  for (const entry of periodEntries) {
    const transaction = getTransaction(entry);

    if (
      !transaction ||
      transaction.transaction_type !== 'expense' ||
      entry.entry_type !== 'debit' ||
      !entry.category_id
    ) {
      continue;
    }

    const current = spendingByCategoryMap.get(entry.category_id) ?? 0;

    spendingByCategoryMap.set(
      entry.category_id,
      current + Number(entry.account_amount),
    );
  }

  const totalSpending = [...spendingByCategoryMap.values()].reduce(
    (total, amount) => total + amount,
    0,
  );

  const spendingByCategory = [...spendingByCategoryMap.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([categoryId, amount]) => ({
      categoryId,
      name: categoryById.get(categoryId) ?? 'Uncategorized',
      amount,
      currency: displayCurrency,
      share: totalSpending > 0 ? amount / totalSpending : 0,
    }));
  /*
   * ─────────────────────────────────────────────────────────────────────────
   * Budgets
   * ─────────────────────────────────────────────────────────────────────────
   */

  const { data: budgetRows, error: budgetsError } = await supabase
    .from('budgets')
    .select(
      `
        id,
        name,
        amount,
        currency,
        start_date,
        end_date,
        budget_categories (
          category_id,
          amount
        )
      `,
    )
    .eq('user_id', user.id)
    .eq('is_active', true)
    .lte('start_date', range.to.toISOString().slice(0, 10))
    .gte('end_date', range.from.toISOString().slice(0, 10))
    .order('start_date', { ascending: false });

  if (budgetsError) {
    throw new Error(`Failed to load budgets: ${budgetsError.message}`);
  }

  const budgets = (budgetRows ?? [])
    .filter((budget) => budget.currency === displayCurrency)
    .map((budget) => {
      const budgetCategoryIds = new Set(
        (budget.budget_categories ?? []).map(
          (budgetCategory) => budgetCategory.category_id,
        ),
      );

      const spent = periodEntries.reduce((total, entry) => {
        const transaction = getTransaction(entry);

        if (
          !transaction ||
          transaction.transaction_type !== 'expense' ||
          entry.entry_type !== 'debit' ||
          !entry.category_id ||
          !budgetCategoryIds.has(entry.category_id)
        ) {
          return total;
        }

        return total + Number(entry.account_amount);
      }, 0);

      return {
        id: budget.id,
        name: budget.name,
        currency: budget.currency as CurrencyCode,
        allocated: Number(budget.amount),
        spent,
      };
    });
      /*
   * ─────────────────────────────────────────────────────────────────────────
   * Goals
   * ─────────────────────────────────────────────────────────────────────────
   */

  const { data: goalRows, error: goalsError } = await supabase
    .from('goals')
    .select(
      `
        id,
        name,
        currency,
        target_amount,
        target_date,
        status,
        goal_contributions (
          amount
        )
      `,
    )
    .eq('user_id', user.id)
    .in('status', ['active', 'in_progress'])
    .order('target_date', { ascending: true, nullsFirst: false });

  if (goalsError) {
    throw new Error(`Failed to load goals: ${goalsError.message}`);
  }

  const goals = (goalRows ?? [])
    .filter((goal) => goal.currency === displayCurrency)
    .map((goal) => {
      const current = (goal.goal_contributions ?? []).reduce(
        (total, contribution) => total + Number(contribution.amount),
        0,
      );

      return {
        id: goal.id,
        name: goal.name,
        currency: goal.currency as CurrencyCode,
        target: Number(goal.target_amount),
        current,
        targetDate: goal.target_date,
      };
    });
      /*
   * ─────────────────────────────────────────────────────────────────────────
   * Upcoming recurring transactions
   * ─────────────────────────────────────────────────────────────────────────
   */

  const today = new Date().toISOString().slice(0, 10);

  const { data: recurringRows, error: recurringError } = await supabase
    .from('recurring_transactions')
    .select(
      `
        id,
        name,
        transaction_type,
        next_occurrence_date,
        recurring_transaction_entries (
          amount,
          currency,
          account_id,
          entry_type
        )
      `,
    )
    .eq('user_id', user.id)
    .eq('is_active', true)
    .gte('next_occurrence_date', today)
    .order('next_occurrence_date', { ascending: true })
    .limit(10);

  if (recurringError) {
    throw new Error(
      `Failed to load recurring transactions: ${recurringError.message}`,
    );
  }

  const upcomingRecurring = (recurringRows ?? [])
    .map((recurring) => {
      const matchingEntry = (recurring.recurring_transaction_entries ?? []).find(
        (entry) => entry.currency === displayCurrency,
      );

      if (!matchingEntry) {
        return null;
      }

      const account = accountById.get(matchingEntry.account_id);

      if (!account) {
        return null;
      }

      const amount = Number(matchingEntry.amount);

      return {
        id: recurring.id,
        name: recurring.name,
        transactionType:
          recurring.transaction_type as DashboardData['upcomingRecurring'][number]['transactionType'],
        amount,
        currency: matchingEntry.currency as CurrencyCode,
        nextOccurrence: recurring.next_occurrence_date,
        accountName: account.name,
      };
    })
    .filter(
      (
        item,
      ): item is DashboardData['upcomingRecurring'][number] =>
        item !== null,
    );

  /*
   * ─────────────────────────────────────────────────────────────────────────
   * Recent transactions
   * ─────────────────────────────────────────────────────────────────────────
   */

  const transactionIds = [
    ...new Set(periodEntries.map((entry) => entry.transaction_id)),
  ];

  const recentTransactionIds = transactionIds.slice(0, 10);

  const { data: recentTransactionRows, error: recentError } = await supabase
    .from('transactions')
    .select(
      `
        id,
        transaction_date,
        description,
        transaction_type,
        merchant_id
      `,
    )
    .eq('user_id', user.id)
    .in('id', recentTransactionIds)
    .order('transaction_date', { ascending: false })
    .limit(10);

  if (recentError) {
    throw new Error(
      `Failed to load recent transactions: ${recentError.message}`,
    );
  }

  const merchantIds = [
    ...new Set(
      (recentTransactionRows ?? [])
        .map((transaction) => transaction.merchant_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const { data: merchants, error: merchantsError } = merchantIds.length
    ? await supabase
        .from('merchants')
        .select('id, name')
        .eq('user_id', user.id)
        .in('id', merchantIds)
    : { data: [], error: null };

  if (merchantsError) {
    throw new Error(
      `Failed to load merchants: ${merchantsError.message}`,
    );
  }

  const merchantById = new Map(
    (merchants ?? []).map((merchant) => [merchant.id, merchant.name]),
  );

  const entriesByTransaction = new Map<
    string,
    typeof entryRows
  >();

  for (const entry of entryRows) {
    const existing = entriesByTransaction.get(entry.transaction_id) ?? [];
    existing.push(entry);
    entriesByTransaction.set(entry.transaction_id, existing);
  }

  const recentTransactions = (recentTransactionRows ?? []).map(
    (transaction) => {
      const transactionEntries =
        entriesByTransaction.get(transaction.id) ?? [];

      const primaryEntry =
        transactionEntries.find(
          (entry) =>
            entry.entry_type ===
            (transaction.transaction_type === 'income'
              ? 'credit'
              : 'debit'),
        ) ?? transactionEntries[0];

      const account = primaryEntry
        ? accountById.get(primaryEntry.account_id)
        : undefined;

      const categoryId = primaryEntry?.category_id ?? null;

      const signedAmount = transactionEntries.reduce(
        (total, entry) => {
          const amount = Number(entry.account_amount);

          return entry.entry_type === 'credit'
            ? total + amount
            : total - amount;
        },
        0,
      );

      return {
        id: transaction.id,
        date: transaction.transaction_date,
        description:
          transaction.description ??
          merchantById.get(transaction.merchant_id ?? '') ??
          'Transaction',
        transactionType:
          transaction.transaction_type as DashboardData['recentTransactions'][number]['transactionType'],
        amount: signedAmount,
        currency:
          account?.currency as CurrencyCode,
        accountName: account?.name ?? 'Unknown account',
        categoryName: categoryId
          ? categoryById.get(categoryId) ?? null
          : null,
        merchantName: transaction.merchant_id
          ? merchantById.get(transaction.merchant_id) ?? null
          : null,
        isSplit: transactionEntries.length > 1,
      };
    },
  );

  return {
    displayCurrency,

    netPosition: {
      net: {
        amount: net,
        currency: displayCurrency,
      },
      assets: {
        amount: assets,
        currency: displayCurrency,
      },
      liabilities: {
        amount: liabilities,
        currency: displayCurrency,
      },
      change: null,
      excludedCurrencies,
    },

    cashFlow: {
      currency: displayCurrency,
      income,
      expenses,
      net: income - expenses,
      series: cashFlowSeries,
    },

    accounts: accountBalances,
    spendingByCategory,
    recentTransactions,
    budgets,
    goals,
    upcomingRecurring,
  };
}

export function emptyDashboard(displayCurrency = 'INR'): DashboardData {
  return {
    displayCurrency,
    netPosition: {
      net: { amount: 0, currency: displayCurrency },
      assets: { amount: 0, currency: displayCurrency },
      liabilities: { amount: 0, currency: displayCurrency },
      change: null,
      excludedCurrencies: [],
    },
    cashFlow: {
      currency: displayCurrency,
      income: 0,
      expenses: 0,
      net: 0,
      series: [],
    },
    accounts: [],
    spendingByCategory: [],
    recentTransactions: [],
    budgets: [],
    goals: [],
    upcomingRecurring: [],
  };
}