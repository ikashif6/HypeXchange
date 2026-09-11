import Link from "next/link";
import type { ProductPublic } from "@/types";
import { formatPrice } from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export interface TopListProps {
  title: string;
  products: ProductPublic[];
  metric?: "change24h" | "change7d" | "price";
  className?: string;
  limit?: number;
  emptyTitle?: string;
}

export function TopList({
  title,
  products,
  metric = "change24h",
  className,
  limit = 5,
  emptyTitle = "Nothing here yet",
}: TopListProps) {
  const items = products.slice(0, limit);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.06em] text-hx-muted">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} compact />
        ) : (
          <ul className="divide-y divide-hx-border">
            {items.map((product, index) => {
              const change =
                metric === "change7d" ? product.change7d : product.change24h;

              return (
                <li key={product.id}>
                  <Link
                    href={`/market/${product.slug}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-hx-bg/70"
                  >
                    <span className="w-4 shrink-0 text-center font-mono-num text-[11px] text-hx-muted">
                      {index + 1}
                    </span>
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
                    <div className="shrink-0 space-y-0.5 text-right">
                      <p className="font-mono-num text-xs font-semibold text-hx-text">
                        ${formatPrice(product.currentPrice)}
                      </p>
                      {metric !== "price" ? <ChangeBadge value={change} /> : null}
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
