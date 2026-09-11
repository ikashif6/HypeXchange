import Link from "next/link";
import { auth } from "@/auth";
import {
  getDashboardSnapshot,
  getPortfolio,
  getProductPriceHistory,
} from "@/lib/market/queries";
import {
  formatCompact,
  formatIxD,
  formatPrice,
  formatShares,
} from "@/lib/formatting/decimal";
import { MarketTickerCard } from "@/components/market/market-ticker-card";
import { MarketLeaders } from "@/components/market/market-leaders";
import { MarketTable } from "@/components/market/market-table";
import { TopList } from "@/components/market/top-list";
import { ActivityStrip } from "@/components/market/activity-strip";
import { BalanceCard } from "@/components/portfolio/balance-card";
import { PriceChart } from "@/components/charts/price-chart";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProductPublic, TradePublic } from "@/types";
import { STARTING_CASH_IXD } from "@/types";

const EMPTY_SNAPSHOT = {
  featured: [] as ProductPublic[],
  topProducts: [] as ProductPublic[],
  topGainers: [] as ProductPublic[],
  topLosers: [] as ProductPublic[],
  marketLeaders: [] as ProductPublic[],
  recentActivity: [] as TradePublic[],
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const isLoggedIn = Boolean(user?.profileId);

  let snapshot = EMPTY_SNAPSHOT;
  try {
    snapshot = await getDashboardSnapshot();
  } catch {
    snapshot = EMPTY_SNAPSHOT;
  }

  let cashBalance = user?.cashBalance ?? STARTING_CASH_IXD;
  let portfolioChart: { t: string; price: number }[] = [];
  let portfolioValue = cashBalance;

  if (isLoggedIn && user?.profileId) {
    try {
      const portfolio = await getPortfolio(user.profileId);
      cashBalance = portfolio.cash;
      portfolioValue = portfolio.portfolioValue;
      portfolioChart = portfolio.holdings
        .filter((h) => h.product)
        .map((h) => ({
          t: h.product!.ticker,
          price: h.value ?? 0,
        }));
      if (portfolioChart.length === 0) {
        portfolioChart = [{ t: "Cash", price: cashBalance }];
      }
    } catch {
      // keep session cash
    }
  }

  let guestChart: { t: string; price: number }[] = [];
  if (!isLoggedIn && snapshot.featured[0]) {
    try {
      const history = await getProductPriceHistory(snapshot.featured[0].id, "7D");
      guestChart = history.map((p) => ({ t: p.time, price: p.price }));
    } catch {
      guestChart = snapshot.featured.map((p) => ({
        t: p.ticker,
        price: p.currentPrice,
      }));
    }
  }

  const marketProducts =
    snapshot.topProducts.length > 0
      ? snapshot.topProducts
      : [...snapshot.featured, ...snapshot.topGainers].slice(0, 12);

  return (
    <div className="flex flex-col gap-5">
      <ActivityStrip trades={snapshot.recentActivity} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
            {isLoggedIn ? "Dashboard" : "Market Overview"}
          </h1>
          <p className="text-sm text-hx-secondary">
            {isLoggedIn
              ? "Track your IXD portfolio and the fictional hype market."
              : "Buy and sell fictional shares of internet products, with no real money involved."}
          </p>
        </div>
        {!isLoggedIn ? (
          <Link
            href="/auth/signin"
            className="btn-raised inline-flex h-9 shrink-0 items-center justify-center rounded-[9px] px-3.5 text-sm font-medium"
          >
            Start with 10,000 IXD
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {snapshot.featured.length > 0
          ? snapshot.featured.map((product) => (
              <MarketTickerCard key={product.id} product={product} />
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex min-h-[96px] items-center justify-center rounded-[10px] border border-dashed border-hx-border bg-hx-card text-xs text-hx-muted"
              >
                No featured product
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-10">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 px-4 py-3.5">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.06em] text-hx-muted">
                {isLoggedIn ? "Portfolio Value" : "The Hype Market"}
              </CardTitle>
              <div className="flex items-end justify-between gap-3">
                <p className="text-sm text-hx-secondary">
                  {isLoggedIn
                    ? "Your fictional portfolio over time"
                    : "Prices of internet products on this fictional market"}
                </p>
                {isLoggedIn ? (
                  <span className="shrink-0 font-mono-num text-base font-semibold text-hx-text">
                    {formatIxD(portfolioValue)}
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-4 pt-1">
              <PriceChart
                embedded
                data={isLoggedIn ? portfolioChart : guestChart}
                height={240}
                showAxes
              />
            </CardContent>
          </Card>

          <MarketLeaders
            products={
              snapshot.marketLeaders.length > 0
                ? snapshot.marketLeaders
                : snapshot.topGainers
            }
          />
        </div>

        <div className="flex flex-col gap-4 lg:col-span-3">
          {isLoggedIn ? (
            <BalanceCard cashBalance={cashBalance} />
          ) : (
            <Card>
              <CardContent className="space-y-3.5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-hx-muted">
                  Get started
                </p>
                <p className="font-mono-num text-2xl font-semibold tracking-tight text-hx-text">
                  10,000 IXD
                </p>
                <p className="text-sm leading-relaxed text-hx-secondary">
                  Sign in to get fictional cash for trading. You cannot deposit or withdraw real money.
                </p>
                <Link
                  href="/auth/signin"
                  className="btn-raised inline-flex h-11 w-full items-center justify-center rounded-[9px] text-sm font-medium"
                >
                  Sign in
                </Link>
              </CardContent>
            </Card>
          )}
          <TopList title="Top Products" products={snapshot.topProducts} metric="price" />
          <TopList title="Top Gainers" products={snapshot.topGainers} />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-hx-text">Market</h2>
          <Link href="/market" className="text-xs font-medium text-hx-link hover:underline">
            View all
          </Link>
        </div>
        <MarketTable
          products={marketProducts}
          emptyTitle="Market is quiet"
          emptyDescription="Products will appear once the database is connected."
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-hx-text">Recent activity</h2>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {snapshot.recentActivity.length === 0 ? (
              <EmptyState
                title="No trades yet"
                description="When traders buy and sell, activity shows up here."
                compact
              />
            ) : (
              <ul className="divide-y divide-hx-border">
                {snapshot.recentActivity.map((trade) => (
                  <li key={trade.id}>
                    <ActivityRow trade={trade} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ActivityRow({ trade }: { trade: TradePublic }) {
  const product = trade.product;
  const user = trade.user;
  const sideLabel = trade.side === "buy" ? "bought" : "sold";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {product ? (
        <ProductLogo
          name={product.name}
          logoUrl={product.logoUrl}
          domain={product.domain}
          size="md"
        />
      ) : (
        <div className="size-9 shrink-0" />
      )}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm text-hx-text">
          {user ? (
            <Link
              href={`/u/${user.username}`}
              className="font-medium hover:text-hx-link"
            >
              {user.displayName || user.username}
            </Link>
          ) : (
            <span className="font-medium">Trader</span>
          )}{" "}
          <span className="text-hx-secondary">{sideLabel}</span>{" "}
          {product ? (
            <Link
              href={`/market/${product.slug}`}
              className="font-medium hover:text-hx-link"
            >
              ${product.ticker}
            </Link>
          ) : (
            <span>a product</span>
          )}
        </p>
        <p className="font-mono-num text-[11px] text-hx-muted">
          {formatShares(trade.shares)} sh · {formatIxD(trade.cashAmount)} · $
          {formatPrice(trade.priceAfter)}
        </p>
      </div>
      <div className="shrink-0 space-y-0.5 text-right">
        <ChangeBadge
          value={
            trade.priceBefore === 0
              ? 0
              : ((trade.priceAfter - trade.priceBefore) / trade.priceBefore) * 100
          }
        />
        <p className="font-mono-num text-[10px] text-hx-muted">
          {formatCompact(trade.fee)} fee
        </p>
      </div>
    </div>
  );
}
