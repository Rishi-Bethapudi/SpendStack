import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { Section, SectionList } from '@/components/shared/section';
import { EmptyState } from '@/components/shared/empty-state';
import { Money, LiabilityBalance } from '@/components/shared/money';
import { Button } from '@/components/ui/button';
import { accountTypeMeta, isLiabilityAccount } from '@/lib/domain/account-types';
import type { AccountBalanceView } from '@/lib/domain/dashboard';

export function AccountBalances({ accounts }: { accounts: AccountBalanceView[] }) {
  return (
    <Section title="Accounts" href="/accounts" flush>
      {accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add an account and SpendStack can start tracking its balance."
          action={
            <Button asChild size="sm">
              <Link href="/accounts/new">Add account</Link>
            </Button>
          }
        />
      ) : (
        <SectionList>
          {accounts.map((account) => {
            const meta = accountTypeMeta(account.accountType);
            const Icon = meta.icon;
            const liability = isLiabilityAccount(account.accountType);

            return (
              <li key={account.id}>
                <Link
                  href={`/accounts/${account.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/50 sm:px-5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{account.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {meta.label}
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    {liability ? (
                      <LiabilityBalance
                        amount={account.balance}
                        currency={account.currency}
                        size="sm"
                      />
                    ) : (
                      <Money
                        amount={account.balance}
                        currency={account.currency}
                        size="sm"
                      />
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </SectionList>
      )}
    </Section>
  );
}
