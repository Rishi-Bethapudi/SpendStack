import { TrendingDown, TrendingUp } from 'lucide-react';
import { Money } from '@/components/shared/money';
import { Stat } from '@/components/shared/stat';
import type { NetPositionView } from '@/lib/domain/dashboard';

/**
 * The one loud element on the dashboard. Everything else is quiet so this
 * figure reads first — it is the number people open the app to see.
 */
export function NetPosition({
  data,
  periodLabel,
}: {
  data: NetPositionView;
  periodLabel: string;
}) {
  const change = data.change;
  const rising = (change?.amount ?? 0) > 0;
  const TrendIcon = rising ? TrendingUp : TrendingDown;

  return (
    <section
      aria-labelledby="net-position-heading"
      className="rounded-lg border border-border bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h2 id="net-position-heading" className="text-sm text-muted-foreground">
            Net position
          </h2>

          <Money
            amount={data.net.amount}
            currency={data.net.currency}
            size="xl"
            role="neutral"
            className="block"
          />

          {change ? (
            <p className="flex items-center gap-1.5 text-sm">
              <TrendIcon
                className={rising ? 'size-4 text-credit' : 'size-4 text-debit'}
                aria-hidden="true"
              />
              <Money
                amount={change.amount}
                currency={change.currency}
                role="auto"
                signed
                srPrefix={rising ? 'Up by' : 'Down by'}
              />
              <span className="text-muted-foreground">{periodLabel.toLowerCase()}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No earlier data to compare against yet.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <Stat
            label="What you hold"
            value={
              <Money
                amount={data.assets.amount}
                currency={data.assets.currency}
                size="sm"
              />
            }
          />
          <Stat
            label="What you owe"
            value={
              <Money
                amount={Math.abs(data.liabilities.amount)}
                currency={data.liabilities.currency}
                size="sm"
                role={data.liabilities.amount !== 0 ? 'debit' : 'neutral'}
              />
            }
          />
        </div>
      </div>

      {/* Balances in other currencies are excluded rather than converted at a
          rate we do not have. Saying so is better than a wrong total. */}
      {data.excludedCurrencies.length > 0 ? (
        <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
          Excludes balances held in {data.excludedCurrencies.join(', ')}. Currency
          conversion is not set up yet.
        </p>
      ) : null}
    </section>
  );
}
