import Decimal from "decimal.js";

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export function d(value: Decimal.Value): Decimal {
  return new Decimal(value);
}

export function toNumberSafe(value: Decimal.Value, digits = 8): number {
  return Number(new Decimal(value).toDecimalPlaces(digits).toString());
}

export function formatIxD(
  value: Decimal.Value,
  options?: {
    compact?: boolean;
    digits?: number;
    prefix?: boolean;
    /** When false, omit the trailing " IXD" (default true). */
    unit?: boolean;
  },
): string {
  const amount = new Decimal(value);
  const digits = options?.digits ?? 2;
  const withUnit = options?.unit !== false;

  if (options?.compact && amount.abs().gte(1_000_000)) {
    const compact = amount.div(1_000_000).toDecimalPlaces(2).toString();
    if (options.prefix) return `$${compact}M`;
    return withUnit ? `${compact}M IXD` : `${compact}M`;
  }

  const formatted = amount.toNumber().toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  if (options?.prefix) return `$${formatted}`;
  return withUnit ? `${formatted} IXD` : formatted;
}

export function formatPrice(value: Decimal.Value, digits = 2): string {
  const amount = new Decimal(value);
  const places = amount.abs().lt(1) ? Math.max(digits, 4) : digits;
  return amount.toNumber().toLocaleString("en-US", {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });
}

export function formatShares(value: Decimal.Value, digits = 4): string {
  return new Decimal(value)
    .toDecimalPlaces(digits)
    .toNumber()
    .toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
}

export function formatPercent(value: Decimal.Value, digits = 2): string {
  const amount = new Decimal(value);
  const sign = amount.gt(0) ? "+" : "";
  return `${sign}${amount.toFixed(digits)}%`;
}

export function formatCompact(value: Decimal.Value): string {
  const n = new Decimal(value).toNumber();
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
}
