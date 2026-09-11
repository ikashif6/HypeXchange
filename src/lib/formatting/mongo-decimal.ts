import { Types } from "mongoose";
import { Decimal, d, toNumberSafe } from "@/lib/formatting/decimal";

export function toDecimal128(value: Decimal.Value): Types.Decimal128 {
  const normalized = new Decimal(value).toFixed();
  return Types.Decimal128.fromString(normalized);
}

export function fromDecimal128(
  value: Types.Decimal128 | string | number | Decimal | null | undefined,
): Decimal {
  if (value == null) return new Decimal(0);
  if (value instanceof Decimal) return value;
  if (typeof value === "object" && "toString" in value) {
    return new Decimal(value.toString());
  }
  return new Decimal(value);
}

export { d, Decimal, toNumberSafe };
