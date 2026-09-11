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
  const map = await batchAnchorPrices(
    [
      typeof productId === "string" ? new Types.ObjectId(productId) : productId,
    ],
    since,
  );
  const id = typeof productId === "string" ? productId : productId.toString();
  const base = map.get(id);
  if (base == null || base === 0) {
    return fallbackChangePct(currentPrice, startingPrice);
  }
  return ((currentPrice - base) / base) * 100;
}

/**
 * Earliest PriceHistory price per product at/after `since` — one aggregation
 * instead of N findOnes (critical for market/dashboard load time).
 */
export async function batchAnchorPrices(
  productIds: Types.ObjectId[],
  since: Date,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (productIds.length === 0) return map;

  const rows = await PriceHistory.aggregate<{
    _id: Types.ObjectId;
    price: unknown;
  }>([
    {
      $match: {
        productId: { $in: productIds },
        createdAt: { $gte: since },
      },
    },
    { $sort: { productId: 1, createdAt: 1 } },
    {
      $group: {
        _id: "$productId",
        price: { $first: "$price" },
      },
    },
  ]);

  for (const row of rows) {
    map.set(row._id.toString(), toNumberSafe(fromDecimal128(row.price as never)));
  }
  return map;
}

export function changePctFromAnchor(
  currentPrice: number,
  startingPrice: number,
  anchor: number | undefined,
): number {
  if (anchor == null || anchor === 0) {
    return fallbackChangePct(currentPrice, startingPrice);
  }
  return ((currentPrice - anchor) / anchor) * 100;
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
