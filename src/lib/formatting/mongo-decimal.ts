import { Types } from "mongoose";
import { Decimal, d, toNumberSafe } from "@/lib/formatting/decimal";

/** BSON Decimal128 cannot store arbitrary-length fraction strings from AMM math. */
const DECIMAL128_PLACES = 12;

export function toDecimal128(value: Decimal.Value): Types.Decimal128 {
  const normalized = new Decimal(value)
    .toDecimalPlaces(DECIMAL128_PLACES, Decimal.ROUND_HALF_UP)
    .toFixed();
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
