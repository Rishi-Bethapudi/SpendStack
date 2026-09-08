/** Progress arithmetic shared by budgets and goals. */

export function formatPercent(
  fraction: number,
  options: { locale?: string; digits?: number } = {},
): string {
  return new Intl.NumberFormat(options.locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: options.digits ?? 0,
  }).format(fraction);
}

/**
 * Fraction of `target` reached by `current`. Returns 0 for a non-positive
 * target so a malformed budget or goal cannot produce Infinity or NaN.
 * Not clamped — callers need to know when something has gone over.
 */
export function progressFraction(current: number, target: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0;
  return current / target;
}

/** Clamped to 0–1 for bar widths, which must never overflow their track. */
export function progressWidth(current: number, target: number): number {
  return Math.min(Math.max(progressFraction(current, target), 0), 1);
}
