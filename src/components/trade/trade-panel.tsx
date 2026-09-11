"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle2, X } from "lucide-react";
import type {
  BuyTradeResult,
  ProductPublic,
  SellTradeResult,
  TradeEstimate,
} from "@/types";
import { FEE_RATE_LABEL } from "@/types";
import {
  formatIxD,
  formatPercent,
  formatPrice,
  formatShares,
} from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductLogo } from "@/components/product/product-logo";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

type Side = "buy" | "sell";

type EstimateResponse = TradeEstimate & { valid?: boolean; error?: string };

export interface TradePanelProps {
  product: ProductPublic;
  cashBalance: number;
  ownedShares: number;
  isAuthenticated: boolean;
  className?: string;
  onTradeComplete?: () => void;
}

const BUY_QUICK = [25, 50, 100, 250, 500];
const SELL_QUICK = [0.25, 0.5, 0.75, 1];

export function TradePanel({
  product,
  cashBalance,
  ownedShares,
  isAuthenticated,
  className,
  onTradeComplete,
}: TradePanelProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [side, setSide] = React.useState<Side>("buy");
  const [amount, setAmount] = React.useState("");
  const [estimate, setEstimate] = React.useState<EstimateResponse | null>(null);
  const [estimating, setEstimating] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<BuyTradeResult | SellTradeResult | null>(
    null,
  );

  const numeric = Number(amount);
  const validInput = Number.isFinite(numeric) && numeric > 0;

  React.useEffect(() => {
    setAmount("");
    setEstimate(null);
    setError(null);
  }, [side, product.id]);

  React.useEffect(() => {
    if (!validInput) {
      setEstimate(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setEstimating(true);
      setError(null);
      try {
        const params =
          side === "buy"
            ? `productId=${encodeURIComponent(product.id)}&amount=${numeric}`
            : `productId=${encodeURIComponent(product.id)}&shares=${numeric}`;
        const res = await fetch(`/api/trade/${side}?${params}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as EstimateResponse & { error?: string };
        if (!res.ok) {
          setEstimate(null);
          setError(data.error ?? "Could not estimate trade.");
          return;
        }
        setEstimate(data);
        if (data.valid === false && data.error) setError(data.error);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError("Could not estimate trade.");
      } finally {
        setEstimating(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [validInput, numeric, product.id, side]);

  function requireAuth() {
    router.push(`/auth/signin?callbackUrl=/market/${product.slug}`);
  }

  function applyBuyQuick(value: number) {
    // Always fill the clicked amount (guests have 0 cash; estimate/submit enforce balance).
    setAmount(String(value));
    setError(null);
  }

  function applySellQuick(fraction: number) {
    if (ownedShares <= 0) {
      setAmount("");
      return;
    }
    const shares = ownedShares * fraction;
    const formatted = Number(shares.toFixed(6)).toString();
    setAmount(formatted);
    setError(null);
  }

  const buyQuickSelected = BUY_QUICK.find((v) => amount === String(v));
  const sellQuickSelected = SELL_QUICK.find((f) => {
    if (ownedShares <= 0 || !amount) return false;
    const expected = Number((ownedShares * f).toFixed(6)).toString();
    return amount === expected;
  });

  async function submitTrade() {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    if (!validInput) {
      setError(side === "buy" ? "Enter an amount to buy." : "Enter shares to sell.");
      return;
    }
    if (estimate?.valid === false) {
      setError(estimate.error ?? "Invalid trade.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const body =
        side === "buy"
          ? { productId: product.id, amount: numeric }
          : { productId: product.id, shares: numeric };

      const res = await fetch(`/api/trade/${side}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Trade failed.");
        return;
      }
      setSuccess(data as BuyTradeResult | SellTradeResult);
      setAmount("");
      setEstimate(null);
      const nextCash =
        "newCashBalance" in data && typeof data.newCashBalance === "number"
          ? data.newCashBalance
          : null;
      if (nextCash != null) {
        window.dispatchEvent(
          new CustomEvent("hx:cash", { detail: { cash: nextCash } }),
        );
      }
      onTradeComplete?.();
      await updateSession();
      router.refresh();
    } catch {
      setError("Trade failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="!flex !flex-row !items-center gap-2.5 space-y-0 px-4 py-3">
          <ProductLogo name={product.name} logoUrl={product.logoUrl} domain={product.domain} size="sm" />
          <div className="min-w-0 flex-1 space-y-0.5">
            <CardTitle className="truncate text-sm">{product.name}</CardTitle>
            <p className="font-mono-num text-[11px] text-hx-muted">
              ${product.ticker} · ${formatPrice(product.currentPrice)}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3.5 px-4 py-4">
          <div className="grid grid-cols-2 gap-1 rounded-[9px] bg-hx-bg p-1">
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={cn(
                "h-8 rounded-[7px] text-xs font-semibold transition-colors",
                side === "buy"
                  ? "bg-hx-primary text-white"
                  : "text-hx-secondary hover:text-hx-text",
              )}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={cn(
                "h-8 rounded-[7px] text-xs font-semibold transition-colors",
                side === "sell"
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-hx-secondary hover:text-hx-text",
              )}
            >
              Sell
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px] text-hx-muted">
            <span className="truncate">
              {side === "buy"
                ? `Available ${formatIxD(cashBalance)}`
                : `Owned ${formatShares(ownedShares)} $${product.ticker}`}
            </span>
            <span className="shrink-0">Fee {FEE_RATE_LABEL}</span>
          </div>

          <Input
            label={side === "buy" ? "Amount (IXD)" : "Shares"}
            inputMode="decimal"
            placeholder={side === "buy" ? "0.00" : "0"}
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            rightAddon={side === "buy" ? "IXD" : "SH"}
          />

          <div className="flex flex-wrap gap-1.5">
            {side === "buy"
              ? BUY_QUICK.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => applyBuyQuick(v)}
                    aria-pressed={buyQuickSelected === v}
                    className={cn("hx-chip hx-chip-sm", buyQuickSelected === v && "hx-chip-active")}
                  >
                    {v}
                  </button>
                ))
              : SELL_QUICK.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => applySellQuick(f)}
                    disabled={ownedShares <= 0}
                    aria-pressed={sellQuickSelected === f}
                    className={cn("hx-chip hx-chip-sm", sellQuickSelected === f && "hx-chip-active")}
                  >
                    {f === 1 ? "Max" : `${f * 100}%`}
                  </button>
                ))}
          </div>

          <div className="space-y-2 rounded-[9px] border border-hx-border bg-hx-bg/70 px-3 py-2.5 text-xs">
            <EstimateRow
              label={side === "buy" ? "You receive" : "You receive"}
              value={
                estimating
                  ? "…"
                  : side === "buy"
                    ? estimate?.sharesReceived != null
                      ? `${formatShares(estimate.sharesReceived)} $${product.ticker}`
                      : "-"
                    : estimate?.netPayout != null
                      ? formatIxD(estimate.netPayout)
                      : "-"
              }
            />
            <EstimateRow
              label="Avg execution"
              value={
                estimate?.avgExecution
                  ? `$${formatPrice(estimate.avgExecution)}`
                  : "-"
              }
            />
            <EstimateRow
              label="Price impact"
              value={estimate ? formatPercent(estimate.priceImpact) : "-"}
            />
            <EstimateRow
              label="Fee"
              value={estimate ? formatIxD(estimate.fee) : "-"}
            />
            <EstimateRow
              label="Est. new price"
              value={
                estimate?.estimatedNewPrice
                  ? `$${formatPrice(estimate.estimatedNewPrice)}`
                  : "-"
              }
            />
          </div>

          {error ? <p className="text-xs text-hx-negative">{error}</p> : null}

          {!isAuthenticated ? (
            <Link
              href={`/auth/signin?callbackUrl=/market/${product.slug}`}
              className="btn-raised inline-flex h-10 w-full items-center justify-center rounded-[9px] text-sm font-medium transition-colors"
            >
              Sign in to trade
            </Link>
          ) : (
            <Button
              className="w-full"
              size="lg"
              loading={submitting}
              variant="primary"
              onClick={submitTrade}
              disabled={!validInput || estimating || estimate?.valid === false}
            >
              {side === "buy" ? `Buy $${product.ticker}` : `Sell $${product.ticker}`}
            </Button>
          )}
        </CardContent>
      </Card>

      {success ? (
        <SuccessModal
          side={"sharesReceived" in success ? "buy" : "sell"}
          result={success}
          onClose={() => setSuccess(null)}
        />
      ) : null}
    </>
  );
}

function EstimateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-hx-muted">{label}</span>
      <span className="font-mono-num font-medium text-hx-text">{value}</span>
    </div>
  );
}

function SuccessModal({
  side,
  result,
  onClose,
}: {
  side: Side;
  result: BuyTradeResult | SellTradeResult;
  onClose: () => void;
}) {
  useBodyScrollLock(true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-hx-overlay p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trade-success-title"
    >
      <div className="w-full max-w-sm rounded-[10px] border border-hx-border bg-hx-card p-4 shadow-lg">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-hx-positive" aria-hidden />
            <h2 id="trade-success-title" className="text-sm font-semibold text-hx-text">
              Trade successful
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-hx-muted hover:bg-hx-bg hover:text-hx-text"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-1.5 text-xs">
          <EstimateRow label="Ticker" value={`$${result.ticker}`} />
          {side === "buy" && "sharesReceived" in result ? (
            <>
              <EstimateRow
                label="Shares bought"
                value={formatShares(result.sharesReceived)}
              />
              <EstimateRow label="Spent" value={formatIxD(result.amountSpent)} />
            </>
          ) : "sharesSold" in result ? (
            <>
              <EstimateRow label="Shares sold" value={formatShares(result.sharesSold)} />
              <EstimateRow label="Received" value={formatIxD(result.netPayout)} />
            </>
          ) : null}
          <EstimateRow label="Fee" value={formatIxD(result.fee)} />
          <EstimateRow
            label="New cash"
            value={formatIxD(result.newCashBalance)}
          />
        </div>
        <Button className="mt-4 w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
