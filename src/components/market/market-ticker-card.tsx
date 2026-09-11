import Link from "next/link";
import type { ProductPublic } from "@/types";
import { formatPrice } from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";

export interface MarketTickerCardProps {
  product: ProductPublic;
  className?: string;
}

export function MarketTickerCard({ product, className }: MarketTickerCardProps) {
  return (
    <Link
      href={`/market/${product.slug}`}
      className={cn(
        "flex min-h-[96px] flex-col justify-between gap-3 rounded-[10px] border border-hx-border bg-hx-card p-3.5",
        "transition-colors hover:border-hx-border hover:bg-hx-bg",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <ProductLogo
          name={product.name}
          logoUrl={product.logoUrl}
          domain={product.domain}
          size="md"
        />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-sm font-medium leading-tight text-hx-text">
            {product.name}
          </p>
          <p className="font-mono-num text-[11px] uppercase tracking-wide text-hx-muted">
            ${product.ticker}
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="font-mono-num text-[15px] font-semibold tracking-tight text-hx-text">
          ${formatPrice(product.currentPrice)}
        </span>
        <ChangeBadge value={product.change24h} />
      </div>
    </Link>
  );
}
