/**
 * Currency-aware formatting. Nothing in SpendStack may hard-code a currency
 * symbol — accounts and transactions each carry their own ISO 4217 code.
 */

export type CurrencyCode = string;

export interface MoneyFormatOptions {
  /** BCP-47 locale. Defaults to the runtime locale. */
  locale?: string;
  /** Always render a leading + or -. Use for signed financial effects. */
  signed?: boolean;
  /** Drop the minor units entirely (e.g. summary figures on small screens). */
  compact?: boolean;
  /** Render the ISO code instead of the symbol, for ambiguous currencies. */
  useCode?: boolean;
}

/**
 * Currencies with no minor unit. Intl knows these, but we need the digit count
 * ourselves when rounding amounts before display.
 */
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'XOF', 'XAF']);

export function minorUnitDigits(currency: CurrencyCode): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2;
}

export function formatMoney(
  amount: number,
  currency: CurrencyCode,
  options: MoneyFormatOptions = {},
): string {
  const { locale, signed = false, compact = false, useCode = false } = options;
  const digits = compact ? 0 : minorUnitDigits(currency);

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: useCode ? 'code' : 'narrowSymbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    notation: compact ? 'compact' : 'standard',
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(amount);

  return formatted;
}

/**
 * The bare number without any currency marker. Use where the currency is
 * already established by an adjacent label or column header.
 */
export function formatAmount(
  amount: number,
  currency: CurrencyCode,
  options: Pick<MoneyFormatOptions, 'locale' | 'signed'> = {},
): string {
  const digits = minorUnitDigits(currency);
  return new Intl.NumberFormat(options.locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: options.signed ? 'exceptZero' : 'auto',
  }).format(amount);
}

/** The symbol alone, for input prefixes and select options. */
export function currencySymbol(currency: CurrencyCode, locale?: string): string {
  const parts = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(0);
  return parts.find((p) => p.type === 'currency')?.value ?? currency;
}

/** Sums are only meaningful within a single currency. */
export function sumSameCurrency(
  entries: ReadonlyArray<{ amount: number; currency: CurrencyCode }>,
  currency: CurrencyCode,
): number {
  return entries
    .filter((e) => e.currency === currency)
    .reduce((total, e) => total + e.amount, 0);
}

/** Distinct currencies present in a collection, in first-seen order. */
export function distinctCurrencies(
  entries: ReadonlyArray<{ currency: CurrencyCode }>,
): CurrencyCode[] {
  const seen: CurrencyCode[] = [];
  for (const entry of entries) {
    if (!seen.includes(entry.currency)) seen.push(entry.currency);
  }
  return seen;
}
