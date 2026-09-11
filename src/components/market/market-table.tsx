"use client";

import * as React from "react";
import Link from "next/link";
import { Info, Search } from "lucide-react";
import type { ProductPublic } from "@/types";
import {
  formatIxD,
  formatPrice,
} from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductRow } from "@/components/market/product-row";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";

export interface MarketTableProps {
  products: ProductPublic[];
  sparklines?: Record<string, number[]>;
  className?: string;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

const HYPE_CAP_TOOLTIP =
  "Hype Cap is a fictional metric: current price × 1,000,000 shares. It does not represent real market capitalization or ownership.";

export function MarketTable({
  products,
  sparklines,
  className,
  searchable = false,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search products…",
  emptyTitle = "No products found",
  emptyDescription = "Try a different search or check back soon.",
}: MarketTableProps) {
  const [internalQuery, setInternalQuery] = React.useState("");
  const query = searchValue ?? internalQuery;

  function handleSearch(next: string) {
    if (searchValue === undefined) setInternalQuery(next);
    onSearchChange?.(next);
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || onSearchChange) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.ticker.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q),
    );
  }, [products, query, onSearchChange]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[10px] border border-hx-border bg-hx-card",
        className,
      )}
    >
      {searchable ? (
        <div className="border-b border-hx-border px-3 py-2.5 sm:px-4">
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            leftAddon={<Search className="size-3.5" aria-hidden />}
            aria-label="Search market"
          />
        </div>
      ) : null}

      {/* Mobile / tablet cards */}
      <ul className="divide-y divide-hx-border md:hidden">
        {filtered.map((product) => (
          <li key={product.id}>
            <Link
              href={`/market/${product.slug}`}
              className="flex items-center gap-3 px-3 py-3.5 transition-colors hover:bg-hx-bg/70 sm:px-4"
            >
              <ProductLogo
                name={product.name}
                logoUrl={product.logoUrl}
                domain={product.domain}
                size="md"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm font-medium text-hx-text">
                  {product.name}
                </p>
                <p className="font-mono-num text-[11px] text-hx-muted">
                  ${product.ticker} · Vol {formatIxD(product.volume24h, { compact: true })}
                </p>
              </div>
              <div className="shrink-0 space-y-0.5 text-right">
                <p className="font-mono-num text-sm font-semibold text-hx-text">
                  ${formatPrice(product.currentPrice)}
                </p>
                <ChangeBadge value={product.change24h} />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-hx-border bg-hx-bg/50 text-[11px] font-medium uppercase tracking-wide text-hx-muted">
              <th className="py-3 pr-3 pl-4 font-medium">Product</th>
              <th className="px-2 py-2.5 text-right font-medium">Price</th>
              <th className="px-2 py-2.5 text-right font-medium">24h</th>
              <th className="hidden px-2 py-2.5 text-right font-medium lg:table-cell">7d</th>
              <th className="hidden px-2 py-2.5 text-right font-medium lg:table-cell">
                24h Volume
              </th>
              <th className="hidden px-2 py-2.5 text-right font-medium xl:table-cell">
                Holders
              </th>
              <th className="hidden px-2 py-2.5 text-right font-medium xl:table-cell">
                Trend
              </th>
              <th className="py-2.5 pr-4 pl-2 text-right font-medium">
                <span
                  className="inline-flex items-center justify-end gap-1"
                  title={HYPE_CAP_TOOLTIP}
                >
                  Hype Cap
                  <Info className="size-3 text-hx-muted" aria-hidden />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                sparkline={sparklines?.[product.id]}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} compact />
      ) : null}
    </div>
  );
}
