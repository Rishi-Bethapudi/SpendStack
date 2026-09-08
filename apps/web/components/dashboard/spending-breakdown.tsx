'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatMoney, formatPercent } from '@spendstack/utils';
import { Section } from '@/components/shared/section';
import { ChartFrame } from '@/components/charts/chart-frame';
import { Money } from '@/components/shared/money';
import type { CategorySpendView } from '@/lib/domain/dashboard';

const SERIES_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

/**
 * The ring is supported by a labelled list, so the breakdown is fully
 * readable without distinguishing six colours — and it is the list, not the
 * ring, that carries the amounts.
 */
export function SpendingBreakdown({
  data,
  periodLabel,
}: {
  data: CategorySpendView[];
  periodLabel: string;
}) {
  const top = data.slice(0, 6);

  return (
    <Section
      title="Where money went"
      description={periodLabel}
      href="/transactions"
    >
      <ChartFrame
        isEmpty={top.length === 0}
        emptyMessage="No spending recorded in this period."
        height={200}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={top}
              dataKey="amount"
              nameKey="name"
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="hsl(var(--surface))"
              strokeWidth={2}
            >
              {top.map((entry, index) => (
                <Cell
                  key={entry.categoryId}
                  fill={SERIES_COLORS[index % SERIES_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-control)',
                fontSize: 12,
                boxShadow: 'var(--shadow-overlay)',
              }}
              formatter={(value, name) => [
                formatMoney(
                  typeof value === 'number' ? value : 0,
                  top[0]?.currency ?? 'INR',
                ),
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartFrame>

      {top.length > 0 ? (
        <ul className="mt-4 space-y-2.5">
          {top.map((entry, index) => (
            <li
              key={entry.categoryId}
              className="flex items-center gap-2.5 text-sm"
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-sm"
                style={{
                  background: SERIES_COLORS[index % SERIES_COLORS.length],
                }}
              />
              <span className="min-w-0 flex-1 truncate">{entry.name}</span>
              <span className="tnum shrink-0 text-xs text-muted-foreground">
                {formatPercent(entry.share)}
              </span>
              <Money
                amount={entry.amount}
                currency={entry.currency}
                className="shrink-0 text-sm font-medium"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
