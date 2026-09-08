import type { Metadata } from 'next';
import { formatDateRange, resolvePeriod } from '@spendstack/utils';
import { PageHeader } from '@/components/layout/page-header';
import { PeriodSelector } from '@/components/dashboard/period-selector';
import { parsePeriod } from '@/lib/dashboard/period';
import { NetPosition } from '@/components/dashboard/net-position';
import { CashFlow } from '@/components/dashboard/cash-flow';
import { SpendingBreakdown } from '@/components/dashboard/spending-breakdown';
import { AccountBalances } from '@/components/dashboard/account-balances';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { BudgetSummary } from '@/components/dashboard/budget-summary';
import { GoalProgress } from '@/components/dashboard/goal-progress';
import { UpcomingRecurring } from '@/components/dashboard/upcoming-recurring';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { DashboardEmpty } from '@/components/dashboard/dashboard-empty';
import { getDashboardData } from '@/lib/queries/dashboard';
import { isDashboardEmpty } from '@/lib/domain/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
};

const PERIOD_LABELS: Record<string, string> = {
  this_month: 'This month',
  last_month: 'Last month',
  this_quarter: 'This quarter',
  this_year: 'This year',
  custom: 'Custom range',
};

/**
 * A server component. Data is fetched here and passed down as props, so the
 * section components stay presentational and know nothing about Supabase.
 */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period);
  const data = await getDashboardData(period);

  const periodLabel = PERIOD_LABELS[period] ?? 'This month';
  const rangeLabel = formatDateRange(resolvePeriod(period));

  if (isDashboardEmpty(data)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <DashboardEmpty />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={rangeLabel}
        action={<PeriodSelector value={period} />}
        toolbar={<QuickActions />}
      />

      <NetPosition data={data.netPosition} periodLabel={periodLabel} />

      {/* Asymmetric on desktop: cash flow gets the width it needs for a
          readable time axis, the breakdown sits beside it. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashFlow data={data.cashFlow} periodLabel={periodLabel} />
        </div>
        <SpendingBreakdown
          data={data.spendingByCategory}
          periodLabel={periodLabel}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
        <AccountBalances accounts={data.accounts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BudgetSummary budgets={data.budgets} />
        <GoalProgress goals={data.goals} />
        <UpcomingRecurring items={data.upcomingRecurring} />
      </div>
    </div>
  );
}
