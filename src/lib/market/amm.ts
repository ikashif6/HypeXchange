import { Decimal, d } from "@/lib/formatting/decimal";
import { TRADING_FEE_RATE } from "@/types";
import type { TradeEstimate } from "@/types";

export interface PoolState {
  cashReserve: Decimal.Value;
  shareReserve: Decimal.Value;
}

export function currentPrice(pool: PoolState): Decimal {
  const x = d(pool.cashReserve);
  const y = d(pool.shareReserve);
  if (y.lte(0)) return d(0);
  return x.div(y);
}

export function estimateBuy(
  pool: PoolState,
  amount: Decimal.Value,
): TradeEstimate & { valid: boolean; error?: string } {
  const spend = d(amount);
  if (!spend.isFinite() || spend.lte(0)) {
    return {
      valid: false,
      error: "Enter an amount greater than zero.",
      amount: 0,
      fee: 0,
      avgExecution: 0,
      priceImpact: 0,
      estimatedNewPrice: 0,
      priceBefore: toNumber(currentPrice(pool)),
    };
  }

  const x = d(pool.cashReserve);
  const y = d(pool.shareReserve);
  const k = x.mul(y);
  const priceBefore = x.div(y);
  const fee = spend.mul(TRADING_FEE_RATE);
  const netSpend = spend.minus(fee);

  if (netSpend.lte(0)) {
    return {
      valid: false,
      error: "Amount too small after fee.",
      amount: toNumber(spend),
      fee: toNumber(fee),
      avgExecution: 0,
      priceImpact: 0,
      estimatedNewPrice: toNumber(priceBefore),
      priceBefore: toNumber(priceBefore),
    };
  }

  const newX = x.plus(netSpend);
  const newY = k.div(newX);
  const sharesReceived = y.minus(newY);

  if (sharesReceived.lte(0) || newY.lte(0)) {
    return {
      valid: false,
      error: "Trade would exhaust pool liquidity.",
      amount: toNumber(spend),
      fee: toNumber(fee),
      avgExecution: 0,
      priceImpact: 0,
      estimatedNewPrice: toNumber(priceBefore),
      priceBefore: toNumber(priceBefore),
    };
  }

  const newPrice = newX.div(newY);
  const avgExecution = netSpend.div(sharesReceived);
  const priceImpact = newPrice.minus(priceBefore).div(priceBefore).mul(100);

  return {
    valid: true,
    amount: toNumber(spend),
    fee: toNumber(fee),
    netSpend: toNumber(netSpend),
    sharesReceived: toNumber(sharesReceived),
    avgExecution: toNumber(avgExecution),
    priceImpact: toNumber(priceImpact),
    estimatedNewPrice: toNumber(newPrice),
    priceBefore: toNumber(priceBefore),
  };
}

export function estimateSell(
  pool: PoolState,
  shares: Decimal.Value,
): TradeEstimate & { valid: boolean; error?: string } {
  const sharesSold = d(shares);
  const x = d(pool.cashReserve);
  const y = d(pool.shareReserve);
  const priceBefore = x.div(y);

  if (!sharesSold.isFinite() || sharesSold.lte(0)) {
    return {
      valid: false,
      error: "Enter shares greater than zero.",
      amount: 0,
      fee: 0,
      avgExecution: 0,
      priceImpact: 0,
      estimatedNewPrice: toNumber(priceBefore),
      priceBefore: toNumber(priceBefore),
    };
  }

  const k = x.mul(y);
  const newY = y.plus(sharesSold);
  const newX = k.div(newY);
  const grossPayout = x.minus(newX);

  if (grossPayout.lte(0) || newX.lte(0)) {
    return {
      valid: false,
      error: "Trade would exhaust pool liquidity.",
      amount: 0,
      fee: 0,
      avgExecution: 0,
      priceImpact: 0,
      estimatedNewPrice: toNumber(priceBefore),
      priceBefore: toNumber(priceBefore),
    };
  }

  const fee = grossPayout.mul(TRADING_FEE_RATE);
  const netPayout = grossPayout.minus(fee);
  const newPrice = newX.div(newY);
  const avgExecution = grossPayout.div(sharesSold);
  const priceImpact = newPrice.minus(priceBefore).div(priceBefore).mul(100);

  return {
    valid: true,
    amount: toNumber(netPayout),
    fee: toNumber(fee),
    sharesSold: toNumber(sharesSold),
    grossPayout: toNumber(grossPayout),
    netPayout: toNumber(netPayout),
    avgExecution: toNumber(avgExecution),
    priceImpact: toNumber(priceImpact),
    estimatedNewPrice: toNumber(newPrice),
    priceBefore: toNumber(priceBefore),
  };
}

export function applyBuy(pool: PoolState, amount: Decimal.Value) {
  const estimate = estimateBuy(pool, amount);
  if (!estimate.valid || estimate.netSpend == null || estimate.sharesReceived == null) {
    throw new Error(estimate.error ?? "Invalid buy");
  }

  const x = d(pool.cashReserve);
  const y = d(pool.shareReserve);
  const k = x.mul(y);
  const netSpend = d(estimate.netSpend);
  const newX = x.plus(netSpend);
  const newY = k.div(newX);
  const sharesReceived = y.minus(newY);
  const fee = d(estimate.fee);
  const newPrice = newX.div(newY);

  return {
    newCashReserve: newX,
    newShareReserve: newY,
    sharesReceived,
    fee,
    netSpend,
    priceBefore: d(estimate.priceBefore),
    priceAfter: newPrice,
  };
}

export function applySell(pool: PoolState, shares: Decimal.Value) {
  const estimate = estimateSell(pool, shares);
  if (!estimate.valid || estimate.netPayout == null || estimate.grossPayout == null) {
    throw new Error(estimate.error ?? "Invalid sell");
  }

  const x = d(pool.cashReserve);
  const y = d(pool.shareReserve);
  const k = x.mul(y);
  const sharesSold = d(shares);
  const newY = y.plus(sharesSold);
  const newX = k.div(newY);
  const grossPayout = x.minus(newX);
  const fee = grossPayout.mul(TRADING_FEE_RATE);
  const netPayout = grossPayout.minus(fee);
  const newPrice = newX.div(newY);

  return {
    newCashReserve: newX,
    newShareReserve: newY,
    sharesSold,
    fee,
    grossPayout,
    netPayout,
    priceBefore: d(estimate.priceBefore),
    priceAfter: newPrice,
  };
}

function toNumber(value: Decimal): number {
  return Number(value.toDecimalPlaces(8).toString());
}

export function hypeCap(price: Decimal.Value, multiplier = 1_000_000): number {
  return Number(d(price).mul(multiplier).toDecimalPlaces(2).toString());
}
