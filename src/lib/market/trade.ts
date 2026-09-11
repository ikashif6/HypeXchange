import mongoose from "mongoose";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { applyBuy, applySell, estimateBuy, estimateSell } from "@/lib/market/amm";
import {
  Decimal,
  d,
  fromDecimal128,
  toDecimal128,
} from "@/lib/formatting/mongo-decimal";
import { Holding, PriceHistory, Product, Profile, Trade } from "@/models";
import type { BuyTradeResult, SellTradeResult } from "@/types";

const MAX_RETRIES = 5;

function isRetryable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: number; codeName?: string; errorLabels?: string[]; message?: string };
  if (e.errorLabels?.includes("TransientTransactionError")) return true;
  if (e.errorLabels?.includes("UnknownTransactionCommitResult")) return true;
  if (e.codeName === "WriteConflict" || e.code === 112) return true;
  if (typeof e.message === "string" && e.message.includes("Write conflict")) return true;
  return false;
}

async function withTransactionRetry<T>(fn: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
  await connectMongo();
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const session = await mongoose.startSession();
    try {
      let result!: T;
      await session.withTransaction(
        async () => {
          result = await fn(session);
        },
        {
          readConcern: { level: "snapshot" },
          writeConcern: { w: "majority" },
          readPreference: "primary",
        },
      );
      return result;
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === MAX_RETRIES - 1) throw error;
      await new Promise((r) => setTimeout(r, 40 * (attempt + 1)));
    } finally {
      session.endSession();
    }
  }

  throw lastError;
}

export async function getBuyEstimate(productId: string, amount: number) {
  await connectMongo();
  const product = await Product.findById(productId).lean();
  if (!product) throw new Error("Product not found");
  if (product.status !== "active") throw new Error("Trading is paused for this product.");

  return estimateBuy(
    {
      cashReserve: fromDecimal128(product.cashReserve),
      shareReserve: fromDecimal128(product.shareReserve),
    },
    amount,
  );
}

export async function getSellEstimate(productId: string, shares: number) {
  await connectMongo();
  const product = await Product.findById(productId).lean();
  if (!product) throw new Error("Product not found");
  if (product.status !== "active") throw new Error("Trading is paused for this product.");

  return estimateSell(
    {
      cashReserve: fromDecimal128(product.cashReserve),
      shareReserve: fromDecimal128(product.shareReserve),
    },
    shares,
  );
}

export async function executeBuyTrade(params: {
  profileId: string;
  productId: string;
  amount: number;
}): Promise<BuyTradeResult> {
  const amount = d(params.amount);
  if (!amount.isFinite() || amount.lte(0)) {
    throw new Error("Enter an amount greater than zero.");
  }

  return withTransactionRetry(async (session) => {
    const profile = await Profile.findById(params.profileId).session(session);
    if (!profile) throw new Error("Profile not found");

    const product = await Product.findById(params.productId).session(session);
    if (!product) throw new Error("Product not found");
    if (product.status !== "active") throw new Error("Trading is paused for this product.");

    const cashBalance = fromDecimal128(profile.cashBalance);
    if (cashBalance.lt(amount)) {
      throw new Error("Insufficient IXD balance.");
    }

    const result = applyBuy(
      {
        cashReserve: fromDecimal128(product.cashReserve),
        shareReserve: fromDecimal128(product.shareReserve),
      },
      amount,
    );

    profile.cashBalance = toDecimal128(cashBalance.minus(amount));
    await profile.save({ session });

    product.cashReserve = toDecimal128(result.newCashReserve);
    product.shareReserve = toDecimal128(result.newShareReserve);
    product.currentPrice = toDecimal128(result.priceAfter);
    product.volume24h = toDecimal128(fromDecimal128(product.volume24h).plus(amount));
    if (result.priceAfter.gt(fromDecimal128(product.allTimeHigh))) {
      product.allTimeHigh = toDecimal128(result.priceAfter);
    }
    await product.save({ session });

    let holding = await Holding.findOne({
      userId: profile._id,
      productId: product._id,
    }).session(session);

    const prevShares = holding ? fromDecimal128(holding.shares) : d(0);
    const prevAvg = holding ? fromDecimal128(holding.averageCost) : d(0);
    const newShares = prevShares.plus(result.sharesReceived);
    const newAvg = prevShares.lte(0)
      ? result.netSpend.div(result.sharesReceived)
      : prevShares.mul(prevAvg).plus(result.netSpend).div(newShares);

    const wasNewHolder = !holding || prevShares.lte(0);

    if (!holding) {
      holding = new Holding({
        userId: profile._id,
        productId: product._id,
        shares: toDecimal128(newShares),
        averageCost: toDecimal128(newAvg),
      });
    } else {
      holding.shares = toDecimal128(newShares);
      holding.averageCost = toDecimal128(newAvg);
    }
    await holding.save({ session });

    if (wasNewHolder) {
      product.holdersCount = (product.holdersCount ?? 0) + 1;
      await product.save({ session });
    }

    await Trade.create(
      [
        {
          userId: profile._id,
          productId: product._id,
          side: "buy",
          cashAmount: toDecimal128(amount),
          shares: toDecimal128(result.sharesReceived),
          priceBefore: toDecimal128(result.priceBefore),
          priceAfter: toDecimal128(result.priceAfter),
          fee: toDecimal128(result.fee),
          realizedPnl: toDecimal128(0),
        },
      ],
      { session },
    );

    await PriceHistory.create(
      [
        {
          productId: product._id,
          price: toDecimal128(result.priceAfter),
          volume: toDecimal128(amount),
        },
      ],
      { session },
    );

    return {
      ok: true as const,
      sharesReceived: Number(result.sharesReceived.toDecimalPlaces(8).toString()),
      fee: Number(result.fee.toDecimalPlaces(8).toString()),
      amountSpent: Number(amount.toDecimalPlaces(8).toString()),
      priceBefore: Number(result.priceBefore.toDecimalPlaces(8).toString()),
      priceAfter: Number(result.priceAfter.toDecimalPlaces(8).toString()),
      newCashBalance: Number(fromDecimal128(profile.cashBalance).toDecimalPlaces(8).toString()),
      ticker: product.ticker,
      productSlug: product.slug,
    };
  });
}

export async function executeSellTrade(params: {
  profileId: string;
  productId: string;
  shares: number;
}): Promise<SellTradeResult> {
  const sharesToSell = d(params.shares);
  if (!sharesToSell.isFinite() || sharesToSell.lte(0)) {
    throw new Error("Enter shares greater than zero.");
  }

  return withTransactionRetry(async (session) => {
    const profile = await Profile.findById(params.profileId).session(session);
    if (!profile) throw new Error("Profile not found");

    const product = await Product.findById(params.productId).session(session);
    if (!product) throw new Error("Product not found");
    if (product.status !== "active") throw new Error("Trading is paused for this product.");

    const holding = await Holding.findOne({
      userId: profile._id,
      productId: product._id,
    }).session(session);

    if (!holding) throw new Error("You do not own any shares of this product.");

    const owned = fromDecimal128(holding.shares);
    if (owned.lt(sharesToSell)) {
      throw new Error("Insufficient shares to sell.");
    }

    const result = applySell(
      {
        cashReserve: fromDecimal128(product.cashReserve),
        shareReserve: fromDecimal128(product.shareReserve),
      },
      sharesToSell,
    );

    const avgCost = fromDecimal128(holding.averageCost);
    const costBasis = avgCost.mul(sharesToSell);
    const realizedPnl = result.netPayout.minus(costBasis);

    profile.cashBalance = toDecimal128(fromDecimal128(profile.cashBalance).plus(result.netPayout));
    await profile.save({ session });

    product.cashReserve = toDecimal128(result.newCashReserve);
    product.shareReserve = toDecimal128(result.newShareReserve);
    product.currentPrice = toDecimal128(result.priceAfter);
    product.volume24h = toDecimal128(fromDecimal128(product.volume24h).plus(result.grossPayout));
    await product.save({ session });

    const remaining = owned.minus(sharesToSell);
    if (remaining.lte(0)) {
      await holding.deleteOne({ session });
      product.holdersCount = Math.max(0, (product.holdersCount ?? 1) - 1);
      await product.save({ session });
    } else {
      holding.shares = toDecimal128(remaining);
      await holding.save({ session });
    }

    await Trade.create(
      [
        {
          userId: profile._id,
          productId: product._id,
          side: "sell",
          cashAmount: toDecimal128(result.netPayout),
          shares: toDecimal128(sharesToSell),
          priceBefore: toDecimal128(result.priceBefore),
          priceAfter: toDecimal128(result.priceAfter),
          fee: toDecimal128(result.fee),
          realizedPnl: toDecimal128(realizedPnl),
        },
      ],
      { session },
    );

    await PriceHistory.create(
      [
        {
          productId: product._id,
          price: toDecimal128(result.priceAfter),
          volume: toDecimal128(result.grossPayout),
        },
      ],
      { session },
    );

    return {
      ok: true as const,
      sharesSold: Number(sharesToSell.toDecimalPlaces(8).toString()),
      fee: Number(result.fee.toDecimalPlaces(8).toString()),
      netPayout: Number(result.netPayout.toDecimalPlaces(8).toString()),
      priceBefore: Number(result.priceBefore.toDecimalPlaces(8).toString()),
      priceAfter: Number(result.priceAfter.toDecimalPlaces(8).toString()),
      newCashBalance: Number(fromDecimal128(profile.cashBalance).toDecimalPlaces(8).toString()),
      realizedPnl: Number(realizedPnl.toDecimalPlaces(8).toString()),
      ticker: product.ticker,
      productSlug: product.slug,
    };
  });
}

export function serializeDecimal(value: unknown): number {
  return Number(fromDecimal128(value as never).toDecimalPlaces(8).toString());
}

export { Decimal, d };
