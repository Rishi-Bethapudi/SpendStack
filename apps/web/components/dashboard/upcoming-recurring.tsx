import Link from 'next/link';
import { Repeat } from 'lucide-react';
import { formatRelativeDay } from '@spendstack/utils';
import { Section, SectionList } from '@/components/shared/section';
import { EmptyState } from '@/components/shared/empty-state';
import { Money } from '@/components/shared/money';
import { Button } from '@/components/ui/button';
import { flowRoleFor, transactionTypeMeta } from '@/lib/domain/transaction-types';
import type { UpcomingRecurringView } from '@/lib/domain/dashboard';

export function UpcomingRecurring({ items }: { items: UpcomingRecurringView[] }) {
  return (
    <Section title="Coming up" href="/recurring" flush>
      {items.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="Nothing scheduled"
          description="Add a repeating payment or income to see it before it lands."
          action={
            <Button asChild size="sm">
              <Link href="/recurring/new">Add recurring</Link>
            </Button>
          }
        />
      ) : (
        <SectionList>
          {items.map((item) => {
            const meta = transactionTypeMeta(item.transactionType);
            const role = flowRoleFor(item.transactionType, item.amount);

            return (
              <li key={item.id}>
                <Link
                  href={`/recurring/${item.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/50 sm:px-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatRelativeDay(item.nextOccurrence)}
                      <span aria-hidden="true"> · </span>
                      {item.accountName}
                    </span>
                  </span>

                  <Money
                    amount={item.amount}
                    currency={item.currency}
                    role={role}
                    size="sm"
                    signed={role !== 'neutral'}
                    srPrefix={meta.srLabel}
                    className="shrink-0"
                  />
                </Link>
              </li>
            );
          })}
        </SectionList>
      )}
    </Section>
  );
}
