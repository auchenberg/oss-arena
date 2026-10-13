const MASK = '••••••';

export function formatMoney(
  amount: number,
  currency: string,
  opts: { compact?: boolean; masked?: boolean; signed?: boolean } = {}
): string {
  if (opts.masked) return MASK;
  try {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      notation: opts.compact ? 'compact' : 'standard',
      maximumFractionDigits: opts.compact ? 2 : 0,
      signDisplay: opts.signed ? 'exceptZero' : 'auto',
    });
    return formatter.format(amount);
  } catch {
    // Hermes without full Intl data, or an unknown currency code.
    const sign = opts.signed && amount > 0 ? '+' : '';
    return `${sign}${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

export function formatUpdatedAt(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
