'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PeriodKey } from '@spendstack/utils';
import { PERIODS } from '@/lib/dashboard/period';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * The period lives in the URL, so a dashboard view is shareable and
 * survives a refresh. No component hard-codes a period.
 *
 * Custom ranges are not offered yet — a date-range picker needs the
 * aggregate queries to accept arbitrary bounds first.
 */
export function PeriodSelector({ value }: { value: PeriodKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(next: PeriodKey | null) {
    if (!next) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('period', next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[9.5rem]" aria-label="Time period">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        {PERIODS.map((period) => (
          <SelectItem key={period.value} value={period.value}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
