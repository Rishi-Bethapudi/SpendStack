import Link from 'next/link';
import { ArrowLeftRight, Split } from 'lucide-react';
import { formatDateShort } from '@spendstack/utils';
import { Section, SectionList } from '@/components/shared/section';
import { EmptyState } from '@/components/shared/empty-state';
import { Money } from '@/components/shared/money';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { flowRoleFor, transactionTypeMeta } from '@/lib/domain/transaction-types';
import type { TransactionSummaryView } from '@/lib/domain/dashboard';

/**
 * Type is carried by an icon, a label and the sign of the amount. Colour
 * reinforces it but is never the only signal — a transfer stays neutral
 * because no money left the user's control.
 */
export function RecentTransactions({
  transactions,
}: {
  transactions: TransactionSummaryView[];
}) {
  return (
    <Section title="Recent activity" href="/transactions" flush>
      {transactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Nothing recorded yet"
          description="Add your first transaction to see it here."
          action={
            <Button asChild size="sm">
              <Link href="/transactions/new">Add transaction</Link>
            </Button>
          }
        />
      ) : (
        <SectionList>
          {transactions.map((transaction) => {
            const meta = transactionTypeMeta(transaction.transactionType);
            const Icon = meta.icon;
            const role = flowRoleFor(transaction.transactionType, transaction.amount);

            return (
              <li key={transaction.id}>
                <Link
                  href={`/transactions/${transaction.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/50 sm:px-5"
                >
                  <span
                    className={
                      role === 'credit'
                        ? 'flex size-9 shrink-0 items-center justify-center rounded-md bg-credit-subtle text-credit'
                        : role === 'debit'
                          ? 'flex size-9 shrink-0 items-center justify-center rounded-md bg-debit-subtle text-debit'
                          : 'flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground'
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">
                        {transaction.merchantName ?? transaction.description}
                      </span>
                      {transaction.isSplit ? (
                        <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[0.6875rem]">
                          <Split className="size-3" aria-hidden="true" />
                          Split
                        </Badge>
                      ) : null}
                    </span>

                    {/* Metadata is truncated on phones rather than wrapped —
                        the amount must never be pushed off the row. */}
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatDateShort(transaction.date)}
                      <span aria-hidden="true"> · </span>
                      {transaction.categoryName ?? meta.label}
                      <span className="hidden sm:inline">
                        <span aria-hidden="true"> · </span>
                        {transaction.accountName}
                      </span>
                    </span>
                  </span>

                  <Money
                    amount={transaction.amount}
                    currency={transaction.currency}
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
