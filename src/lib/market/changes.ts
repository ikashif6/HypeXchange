import { Types } from "mongoose";
import { fromDecimal128, toNumberSafe } from "@/lib/formatting/mongo-decimal";
import { PriceHistory } from "@/models";

/**
 * Price change % from the earliest PriceHistory point at/after `since`,
 * vs current price. Falls back to (current - starting) / starting * 100
 * when no history exists in the window.
 */
export async function computePriceChangePct(
  productId: Types.ObjectId | string,
  currentPrice: number,
  startingPrice: number,
  since: Date,
): Promise<number> {
  const id =
    typeof productId === "string" ? new Types.ObjectId(productId) : productId;

  const anchor = await PriceHistory.findOne({
    productId: id,
    createdAt: { $gte: since },
  })
    .sort({ createdAt: 1 })
    .select({ price: 1 })
    .lean();

  if (!anchor) {
    return fallbackChangePct(currentPrice, startingPrice);
  }

  const base = toNumberSafe(fromDecimal128(anchor.price));
  if (base === 0) return fallbackChangePct(currentPrice, startingPrice);

  return ((currentPrice - base) / base) * 100;
}

/** MVP approximation when no price history is available. */
export function fallbackChangePct(currentPrice: number, startingPrice: number): number {
  if (startingPrice === 0) return 0;
  return ((currentPrice - startingPrice) / startingPrice) * 100;
}

export function lookbackDate(period: "24h" | "7d"): Date {
  const ms = period === "24h" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms);
}
