'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDateShort, formatMoney } from '@spendstack/utils';
import { Section } from '@/components/shared/section';
import { Stat, StatRow } from '@/components/shared/stat';
import { Money } from '@/components/shared/money';
import { ChartFrame } from '@/components/charts/chart-frame';
import type { CashFlowView } from '@/lib/domain/dashboard';

export function CashFlow({
  data,
  periodLabel,
}: {
  data: CashFlowView;
  periodLabel: string;
}) {
  const chartData = data.series.map((point) => ({
    label: formatDateShort(point.date),
    income: point.income,
    // Plotted below the axis so money out reads as a downward quantity.
    expenses: -Math.abs(point.expenses),
  }));

  return (
    <Section title="Cash flow" description={periodLabel}>
      <StatRow className="mb-6 grid-cols-3 sm:grid-cols-3 lg:grid-cols-3">
        <Stat
          label="In"
          value={
            <Money
              amount={data.income}
              currency={data.currency}
              role="credit"
              size="md"
              srPrefix="Money in"
            />
          }
        />
        <Stat
          label="Out"
          value={
            <Money
              amount={data.expenses}
              currency={data.currency}
              role="debit"
              size="md"
              srPrefix="Money out"
            />
          }
        />
        <Stat
          label="Left over"
          value={
            <Money
              amount={data.net}
              currency={data.currency}
              role="auto"
              size="md"
              signed
            />
          }
        />
      </StatRow>

      <ChartFrame
        isEmpty={chartData.length === 0}
        emptyMessage="No income or spending recorded in this period."
        height={220}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
          >
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={64}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value: number) =>
                formatMoney(Math.abs(value), data.currency, { compact: true })
              }
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-control)',
                fontSize: 12,
                boxShadow: 'var(--shadow-overlay)',
              }}
              formatter={(value, name) => [
                formatMoney(
                  Math.abs(typeof value === 'number' ? value : 0),
                  data.currency,
                ),
                name === 'income' ? 'In' : 'Out',
              ]}
            />
            <Bar
              dataKey="income"
              fill="hsl(var(--credit))"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="expenses"
              fill="hsl(var(--debit))"
              radius={[0, 0, 3, 3]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </Section>
  );
}
