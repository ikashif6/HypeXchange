"use client";

import Link from "next/link";
import type { TradePublic } from "@/types";
import { formatIxD, formatShares } from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";

export interface ActivityStripProps {
  trades: TradePublic[];
  className?: string;
}

function TradeChip({ trade }: { trade: TradePublic }) {
  const product = trade.product;
  const user = trade.user;
  const bought = trade.side === "buy";
  const name = user?.displayName || user?.username || "Trader";
  const ticker = product?.ticker ? `$${product.ticker}` : "a product";

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] text-hx-secondary">
      {user?.username ? (
        <Link
          href={`/u/${user.username}`}
          className="font-medium text-hx-text hover:text-hx-link"
        >
          {name}
        </Link>
      ) : (
        <span className="font-medium text-hx-text">{name}</span>
      )}
      <span className={bought ? "text-hx-positive" : "text-hx-negative"}>
        {bought ? "bought" : "sold"}
      </span>
      {product?.slug ? (
        <Link
          href={`/market/${product.slug}`}
          className="font-mono-num font-medium text-hx-text hover:text-hx-link"
        >
          {ticker}
        </Link>
      ) : (
        <span className="font-mono-num font-medium text-hx-text">{ticker}</span>
      )}
      <span className="font-mono-num text-hx-muted">
        · {formatShares(trade.shares)} sh · {formatIxD(trade.cashAmount)}
      </span>
    </span>
  );
}

export function ActivityStrip({ trades, className }: ActivityStripProps) {
  if (trades.length === 0) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-[10px] border border-hx-border bg-hx-card px-4 py-2.5",
          className,
        )}
      >
        <p className="text-[12px] text-hx-muted">
          Recent activity will appear here as traders buy and sell.
        </p>
      </div>
    );
  }

  // Duplicate for seamless marquee when enough items
  const items = trades.length >= 4 ? [...trades, ...trades] : trades;
  const animate = trades.length >= 4;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px] border border-hx-border bg-hx-card",
        className,
      )}
      aria-label="Recent market activity"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-hx-card to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-hx-card to-transparent" />

      <div
        className={cn(
          "flex items-center gap-6 px-4 py-2.5",
          animate && "hx-activity-marquee w-max",
        )}
      >
        {items.map((trade, i) => (
          <span key={`${trade.id}-${i}`} className="inline-flex items-center gap-6">
            <TradeChip trade={trade} />
            <span className="text-hx-border" aria-hidden>
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
