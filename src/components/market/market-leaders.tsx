"use client";

import * as React from "react";
import Link from "next/link";
import type { ProductPublic } from "@/types";
import { formatPercent, formatPrice } from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";
import { Tabs } from "@/components/ui/tabs";
import { ProductLogo } from "@/components/product/product-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export interface MarketLeadersProps {
  products: ProductPublic[];
  className?: string;
  limit?: number;
}

type Period = "24h" | "7d";

export function MarketLeaders({
  products,
  className,
  limit = 6,
}: MarketLeadersProps) {
  const [period, setPeriod] = React.useState<Period>("24h");

  const ranked = React.useMemo(() => {
    const key = period === "24h" ? "change24h" : "change7d";
    return [...products]
      .sort((a, b) => b[key] - a[key])
      .slice(0, limit);
  }, [products, period, limit]);

  const maxAbs = Math.max(
    1,
    ...ranked.map((p) => Math.abs(period === "24h" ? p.change24h : p.change7d)),
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="!flex !flex-row !items-center !justify-between gap-3 space-y-0 px-4 py-3">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.06em] text-hx-muted">
          Market Leaders
        </CardTitle>
        <Tabs
          size="sm"
          value={period}
          onChange={(id) => setPeriod(id as Period)}
          items={[
            { id: "24h", label: "24H" },
            { id: "7d", label: "7D" },
          ]}
        />
      </CardHeader>
      <CardContent className="p-0">
        {ranked.length === 0 ? (
          <EmptyState title="No leaders yet" compact />
        ) : (
          <ul className="divide-y divide-hx-border">
            {ranked.map((product) => {
              const change = period === "24h" ? product.change24h : product.change7d;
              const width = `${Math.max(8, (Math.abs(change) / maxAbs) * 100)}%`;
              const positive = change >= 0;

              return (
                <li key={product.id}>
                  <Link
                    href={`/market/${product.slug}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-hx-bg/70"
                  >
                    <ProductLogo
                      name={product.name}
                      logoUrl={product.logoUrl}
                      domain={product.domain}
                      size="md"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-hx-text">
                            {product.name}
                          </p>
                          <p className="font-mono-num text-[11px] text-hx-muted">
                            ${formatPrice(product.currentPrice)}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 font-mono-num text-xs font-semibold",
                            positive ? "text-hx-positive" : "text-hx-negative",
                          )}
                        >
                          {formatPercent(change)}
                        </span>
                      </div>
                      <div className="h-1 max-w-[140px] overflow-hidden rounded-full bg-hx-bg">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            positive ? "bg-hx-positive/80" : "bg-hx-negative/80",
                          )}
                          style={{ width }}
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
