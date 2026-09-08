import Link from 'next/link';
import { Target } from 'lucide-react';
import { formatMoney, formatRelativeDay, daysUntil } from '@spendstack/utils';
import { Section } from '@/components/shared/section';
import { EmptyState } from '@/components/shared/empty-state';
import { Money } from '@/components/shared/money';
import { ProgressMeter, goalTone } from '@/components/shared/progress-meter';
import { Button } from '@/components/ui/button';
import type { GoalSummaryView } from '@/lib/domain/dashboard';

/** Covers zero, partial, complete, exceeded, no date and overdue. */
function goalStatus(goal: GoalSummaryView): { text: string; tone: 'muted' | 'credit' | 'warning' } {
  if (goal.target > 0 && goal.current > goal.target) {
    return {
      text: `${formatMoney(goal.current - goal.target, goal.currency)} past target`,
      tone: 'credit',
    };
  }
  if (goal.target > 0 && goal.current >= goal.target) {
    return { text: 'Reached', tone: 'credit' };
  }
  if (goal.current === 0) {
    return { text: 'Not started', tone: 'muted' };
  }
  if (goal.targetDate && daysUntil(goal.targetDate) < 0) {
    return { text: `Target date passed ${formatRelativeDay(goal.targetDate)}`, tone: 'warning' };
  }
  if (goal.targetDate) {
    return { text: `Target ${formatRelativeDay(goal.targetDate)}`, tone: 'muted' };
  }
  return { text: 'No target date', tone: 'muted' };
}

export function GoalProgress({ goals }: { goals: GoalSummaryView[] }) {
  return (
    <Section title="Goals" href="/goals">
      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set something you are saving towards and track it here."
          action={
            <Button asChild size="sm">
              <Link href="/goals/new">Create goal</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-4">
          {goals.map((goal) => {
            const status = goalStatus(goal);

            return (
              <li key={goal.id} className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/goals/${goal.id}`}
                    className="truncate rounded text-sm font-medium transition-colors hover:text-primary"
                  >
                    {goal.name}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    <Money
                      amount={goal.current}
                      currency={goal.currency}
                      className="font-medium text-foreground"
                    />
                    {' of '}
                    {formatMoney(goal.target, goal.currency)}
                  </span>
                </div>

                <ProgressMeter
                  current={goal.current}
                  target={goal.target}
                  tone={goalTone(goal.current, goal.target)}
                  label={`${goal.name} progress`}
                />

                <p
                  className={
                    status.tone === 'credit'
                      ? 'text-xs text-credit'
                      : status.tone === 'warning'
                        ? 'text-xs text-warning'
                        : 'text-xs text-muted-foreground'
                  }
                >
                  {status.text}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
