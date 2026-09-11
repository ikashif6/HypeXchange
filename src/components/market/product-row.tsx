import Link from "next/link";
import type { ProductPublic } from "@/types";
import {
  formatCompact,
  formatIxD,
  formatPrice,
} from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";
import { Sparkline } from "@/components/charts/sparkline";
import { VerifiedIcon } from "@/components/ui/verified-icon";

export interface ProductRowProps {
  product: ProductPublic;
  sparkline?: number[];
  className?: string;
}

export function ProductRow({ product, sparkline, className }: ProductRowProps) {
  return (
    <tr
      className={cn(
        "border-b border-hx-border last:border-b-0 hover:bg-hx-bg/70",
        className,
      )}
    >
      <td className="py-3 pr-3 pl-4">
        <Link
          href={`/market/${product.slug}`}
          className="flex min-w-0 items-center gap-3 hover:opacity-90"
        >
          <ProductLogo name={product.name} logoUrl={product.logoUrl} domain={product.domain} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate text-sm font-medium text-hx-text">
                {product.name}
              </span>
              {product.verified ? <VerifiedIcon /> : null}
            </div>
            <span className="font-mono-num text-[11px] uppercase text-hx-muted">
              ${product.ticker}
            </span>
          </div>
        </Link>
      </td>
      <td className="px-2 py-3 text-right font-mono-num text-sm font-medium text-hx-text">
        ${formatPrice(product.currentPrice)}
      </td>
      <td className="px-2 py-3 text-right">
        <ChangeBadge value={product.change24h} />
      </td>
      <td className="hidden px-2 py-3 text-right md:table-cell">
        <ChangeBadge value={product.change7d} />
      </td>
      <td className="hidden px-2 py-3 text-right font-mono-num text-xs text-hx-secondary lg:table-cell">
        {formatIxD(product.volume24h, { compact: true, prefix: true })}
      </td>
      <td className="hidden px-2 py-3 text-right font-mono-num text-xs text-hx-secondary xl:table-cell">
        {formatCompact(product.holdersCount)}
      </td>
      <td className="hidden px-2 py-3 text-right lg:table-cell">
        {sparkline && sparkline.length > 1 ? (
          <Sparkline data={sparkline} positive={product.change24h >= 0} />
        ) : (
          <span className="text-xs text-hx-muted">-</span>
        )}
      </td>
      <td className="py-3 pr-4 pl-2 text-right font-mono-num text-xs text-hx-secondary">
        {formatIxD(product.hypeCap, { compact: true, prefix: true })}
      </td>
    </tr>
  );
}
