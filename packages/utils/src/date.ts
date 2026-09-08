/**
 * Date formatting and period arithmetic. Kept out of components so a user's
 * locale/timezone preference can be threaded through one place later.
 */

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
}

export type PeriodKey =
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(
  value: Date | string,
  options: DateFormatOptions = {},
): string {
  return new Intl.DateTimeFormat(options.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: options.timeZone,
  }).format(toDate(value));
}

/** Compact form for dense tables — omits the year when it is the current year. */
export function formatDateShort(
  value: Date | string,
  options: DateFormatOptions = {},
): string {
  const date = toDate(value);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat(options.locale, {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
    timeZone: options.timeZone,
  }).format(date);
}

/** Heading for a day-grouped transaction list. */
export function formatDateGroupHeading(
  value: Date | string,
  options: DateFormatOptions = {},
): string {
  const date = toDate(value);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return new Intl.DateTimeFormat(options.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: options.timeZone,
  }).format(date);
}

export function formatDateRange(
  range: DateRange,
  options: DateFormatOptions = {},
): string {
  const formatter = new Intl.DateTimeFormat(options.locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: options.timeZone,
  });
  return formatter.formatRange(range.from, range.to);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function resolvePeriod(key: PeriodKey, reference = new Date()): DateRange {
  const year = reference.getFullYear();
  const month = reference.getMonth();

  switch (key) {
    case 'this_month':
      return { from: startOfMonth(reference), to: endOfMonth(reference) };
    case 'last_month': {
      const previous = new Date(year, month - 1, 1);
      return { from: startOfMonth(previous), to: endOfMonth(previous) };
    }
    case 'this_quarter': {
      const quarterStartMonth = Math.floor(month / 3) * 3;
      return {
        from: new Date(year, quarterStartMonth, 1),
        to: endOfMonth(new Date(year, quarterStartMonth + 2, 1)),
      };
    }
    case 'this_year':
      return {
        from: new Date(year, 0, 1),
        to: new Date(year, 11, 31, 23, 59, 59, 999),
      };
    case 'custom':
    default:
      return { from: startOfMonth(reference), to: endOfMonth(reference) };
  }
}

/** Whole days from now until the given date. Negative when already past. */
export function daysUntil(value: Date | string, reference = new Date()): number {
  const target = toDate(value);
  const msPerDay = 86_400_000;
  const a = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const b = Date.UTC(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );
  return Math.round((a - b) / msPerDay);
}

/** Plain-language due label for recurring transactions and goal targets. */
export function formatRelativeDay(
  value: Date | string,
  options: DateFormatOptions = {},
): string {
  const days = daysUntil(value);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1 && days <= 30) return `In ${days} days`;
  if (days < -1 && days >= -30) return `${Math.abs(days)} days ago`;
  return formatDateShort(value, options);
}
