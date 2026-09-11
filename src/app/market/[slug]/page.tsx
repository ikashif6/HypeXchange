import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { auth } from "@/auth";
import {
  getPortfolio,
  getProductBySlug,
  getProductPriceHistory,
  getRecentTrades,
  type PriceHistoryRange,
} from "@/lib/market/queries";
import {
  formatCompact,
  formatIxD,
  formatPercent,
  formatPrice,
  formatShares,
} from "@/lib/formatting/decimal";
import { absoluteUrl, cn } from "@/lib/utils";
import { PriceChart } from "@/components/charts/price-chart";
import { TradePanel } from "@/components/trade/trade-panel";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TradePublic } from "@/types";
import { HYPE_CAP_SHARES } from "@/types";

const RANGES: PriceHistoryRange[] = ["1H", "24H", "7D", "1M", "ALL"];

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return { title: "Product not found" };
    }
    return {
      title: `${product.name} ($${product.ticker}) Price & Market`,
      description:
        product.description ||
        `See ${product.name}'s fictional HypeXchange price, market activity and trading history.`,
      openGraph: {
        title: `${product.name} · $${formatPrice(product.currentPrice)}`,
        description: "A fictional market with no real ownership.",
        url: absoluteUrl(`/market/${product.slug}`),
      },
    };
  } catch {
    return { title: "Market" };
  }
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const rangeRaw = (first(sp.range) as PriceHistoryRange | undefined) ?? "24H";
  const range = RANGES.includes(rangeRaw) ? rangeRaw : "24H";

  const session = await auth();
  const profileId = session?.user?.profileId;

  let product = null;
  try {
    product = await getProductBySlug(slug);
  } catch {
    product = null;
  }
  if (!product) notFound();

  let history: { time: string; price: number; volume: number }[] = [];
  try {
    history = await getProductPriceHistory(product.id, range);
  } catch {
    history = [];
  }

  let ownedShares = 0;
  let cashBalance = session?.user?.cashBalance ?? 0;
  if (profileId) {
    try {
      const portfolio = await getPortfolio(profileId);
      cashBalance = portfolio.cash;
      const holding = portfolio.holdings.find((h) => h.productId === product!.id);
      ownedShares = holding?.shares ?? 0;
    } catch {
      // keep defaults
    }
  }

  let recentTrades: TradePublic[] = [];
  try {
    const all = await getRecentTrades(40);
    recentTrades = all
      .filter(
        (t) => t.productId === product!.id || t.product?.slug === product!.slug,
      )
      .slice(0, 12);
  } catch {
    recentTrades = [];
  }

  const chartData = history.map((p) => ({ t: p.time, price: p.price }));
  const hypeCap = product.currentPrice * HYPE_CAP_SHARES;

  const periodControls = (
    <div className="flex items-center gap-0.5">
      {RANGES.map((r) => (
        <Link
          key={r}
          href={`/market/${product!.slug}?range=${r}`}
          className={cn(
            "inline-flex h-7 min-w-9 items-center justify-center rounded-[7px] px-2 text-[11px] font-medium transition-colors",
            range === r
              ? "bg-hx-primary text-white"
              : "border border-transparent text-hx-secondary hover:border-hx-border hover:bg-hx-bg hover:text-hx-text",
          )}
        >
          {r}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Product header */}
      <header className="flex flex-col gap-3 border-b border-hx-border pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <ProductLogo name={product.name} logoUrl={product.logoUrl} domain={product.domain} size="lg" />
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
                {product.name}
              </h1>
              {product.verified ? <Badge variant="verified">Verified</Badge> : null}
              <Badge variant="outline" className="capitalize">
                {product.status}
              </Badge>
            </div>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-mono-num text-[13px] text-hx-muted">
              <span>${product.ticker}</span>
              <span aria-hidden>·</span>
              <a
                href={`https://${product.domain}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 hover:text-hx-link"
              >
                {product.domain}
                <ExternalLink className="size-3" aria-hidden />
              </a>
              <span aria-hidden>·</span>
              <span>{product.category}</span>
            </p>
            {product.description ? (
              <p className="max-w-2xl text-sm leading-relaxed text-hx-secondary">
                {product.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 space-y-1.5 sm:pt-0.5 sm:text-right">
          <p className="font-mono-num text-2xl font-semibold tracking-tight text-hx-text sm:text-[28px]">
            ${formatPrice(product.currentPrice)}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <ChangeBadge value={product.change24h} />
            <span className="text-[11px] text-hx-muted">24h</span>
            <ChangeBadge value={product.change7d} />
            <span className="text-[11px] text-hx-muted">7d</span>
          </div>
        </div>
      </header>

      {/* Chart + trade */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <PriceChart
          data={chartData}
          height={260}
          periodControls={periodControls}
          className="min-w-0 lg:col-start-1"
        />

        <aside className="lg:col-start-2 lg:row-span-3 lg:sticky lg:top-[4.5rem] lg:self-start">
          <TradePanel
            product={product}
            cashBalance={cashBalance}
            ownedShares={ownedShares}
            isAuthenticated={Boolean(profileId)}
          />
        </aside>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-start-1">
          <Stat
            label="24h Volume"
            value={formatIxD(product.volume24h, { compact: true })}
          />
          <Stat label="Holders" value={formatCompact(product.holdersCount)} />
          <Stat
            label="Hype Cap"
            value={`$${formatCompact(hypeCap)}`}
            title="Hype Cap is a fictional HypeXchange metric and does not represent company valuation."
          />
          <Stat label="Starting" value={`$${formatPrice(product.startingPrice)}`} />
        </div>

        <Card className="overflow-hidden lg:col-start-1">
          <CardHeader className="px-4 py-3">
            <CardTitle>Recent trades</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentTrades.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-hx-muted">
                No trades yet for ${product.ticker}.
              </p>
            ) : (
              <ul className="divide-y divide-hx-border">
                {recentTrades.map((trade) => (
                  <li
                    key={trade.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p
                        className={cn(
                          "font-medium capitalize",
                          trade.side === "buy" ? "text-hx-positive" : "text-hx-negative",
                        )}
                      >
                        {trade.side}
                      </p>
                      <p className="font-mono-num text-[11px] text-hx-muted">
                        {trade.user ? (
                          <Link
                            href={`/u/${trade.user.username}`}
                            className="hover:text-hx-link"
                          >
                            @{trade.user.username}
                          </Link>
                        ) : (
                          "Trader"
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 space-y-0.5 text-right font-mono-num text-xs">
                      <p className="text-hx-text">{formatShares(trade.shares)} sh</p>
                      <p className="text-hx-muted">
                        @ ${formatPrice(trade.priceAfter)} ·{" "}
                        {formatPercent(
                          trade.priceBefore === 0
                            ? 0
                            : ((trade.priceAfter - trade.priceBefore) /
                                trade.priceBefore) *
                                100,
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  title,
}: {
  label: string;
  value: string;
  title?: string;
}) {
  return (
    <div
      className="flex min-h-[72px] flex-col justify-center rounded-[10px] border border-hx-border bg-hx-card px-3.5 py-3"
      title={title}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-hx-muted">
        {label}
      </p>
      <p className="mt-1.5 truncate font-mono-num text-sm font-semibold tabular-nums text-hx-text">
        {value}
      </p>
    </div>
  );
}
