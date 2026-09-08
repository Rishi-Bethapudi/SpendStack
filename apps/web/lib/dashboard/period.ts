import type { PeriodKey } from '@spendstack/utils';

export const PERIODS: { value: PeriodKey; label: string }[] = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'this_quarter', label: 'This quarter' },
  { value: 'this_year', label: 'This year' },
];

export function parsePeriod(value: string | undefined): PeriodKey {
  const known = PERIODS.map((p) => p.value);

  return known.includes(value as PeriodKey)
    ? (value as PeriodKey)
    : 'this_month';
}