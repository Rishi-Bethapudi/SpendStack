import Link from 'next/link';
import { PiggyBank } from 'lucide-react';
import { formatMoney } from '@spendstack/utils';
import { Section } from '@/components/shared/section';
import { EmptyState } from '@/components/shared/empty-state';
import { Money } from '@/components/shared/money';
import { ProgressMeter, budgetTone } from '@/components/shared/progress-meter';
import { Button } from '@/components/ui/button';
import type { BudgetSummaryView } from '@/lib/domain/dashboard';

/** Each state has words as well as a colour, so none of them depends on hue. */
function statusLabel(spent: number, allocated: number): string {
  if (allocated <= 0) return 'No amount set';
  const used = spent / allocated;
  if (used > 1) return 'Over budget';
  if (used >= 0.9) return 'Close to the limit';
  if (used === 0) return 'Not used yet';
  return `${formatMoney(allocated - spent, 'INR', { compact: true })} left`;
}

export function BudgetSummary({ budgets }: { budgets: BudgetSummaryView[] }) {
  return (
    <Section title="Budgets" href="/budgets">
      {budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets set"
          description="Set a budget to see how spending tracks against it."
          action={
            <Button asChild size="sm">
              <Link href="/budgets/new">Create budget</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-4">
          {budgets.map((budget) => {
            const tone = budgetTone(budget.spent, budget.allocated);
            const remaining = budget.allocated - budget.spent;

            return (
              <li key={budget.id} className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/budgets/${budget.id}`}
                    className="truncate rounded text-sm font-medium transition-colors hover:text-primary"
                  >
                    {budget.name}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    <Money
                      amount={budget.spent}
                      currency={budget.currency}
                      className="font-medium text-foreground"
                    />
                    {' of '}
                    {formatMoney(budget.allocated, budget.currency)}
                  </span>
                </div>

                <ProgressMeter
                  current={budget.spent}
                  target={budget.allocated}
                  tone={tone}
                  label={`${budget.name} budget used`}
                />

                <p
                  className={
                    tone === 'over'
                      ? 'text-xs text-danger'
                      : tone === 'caution'
                        ? 'text-xs text-warning'
                        : 'text-xs text-muted-foreground'
                  }
                >
                  {remaining < 0 ? (
                    <>
                      <Money
                        amount={Math.abs(remaining)}
                        currency={budget.currency}
                        role="debit"
                        className="text-xs font-medium"
                      />{' '}
                      over budget
                    </>
                  ) : (
                    statusLabel(budget.spent, budget.allocated)
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
