import Link from "next/link";
import { auth } from "@/auth";
import { getPortfolio } from "@/lib/market/queries";
import {
  formatIxD,
  formatPercent,
  formatPrice,
  formatShares,
} from "@/lib/formatting/decimal";
import { PriceChart } from "@/components/charts/price-chart";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { HoldingPublic } from "@/types";

export default async function PortfolioPage() {
  const session = await auth();
  const profileId = session?.user?.profileId;

  if (!profileId) {
    return (
      <div className="mx-auto max-w-md py-16">
        <EmptyState
          title="Sign in to view portfolio"
          description="Track your fictional IXD holdings, cash, and returns."
          action={
            <Link
              href="/auth/signin?callbackUrl=/portfolio"
              className="btn-raised inline-flex h-10 items-center justify-center rounded-[9px] px-4 text-sm font-medium"
            >
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  let cash = 0;
  let holdings: HoldingPublic[] = [];
  let holdingsValue = 0;
  let portfolioValue = 0;
  let returnPct = 0;
  let profit = 0;

  try {
    const portfolio = await getPortfolio(profileId);
    cash = portfolio.cash;
    holdings = portfolio.holdings;
    holdingsValue = portfolio.holdingsValue;
    portfolioValue = portfolio.portfolioValue;
    returnPct = portfolio.returnPct;
    profit = portfolio.profit;
  } catch {
    // empty fallback
  }

  const chartData = holdings
    .filter((h) => h.product)
    .map((h) => ({
      t: h.product!.ticker,
      price: h.value ?? 0,
    }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
          Portfolio
        </h1>
        <p className="mt-1 text-sm text-hx-secondary">
          Your fictional IXD cash and holdings. You cannot deposit or withdraw real money.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <MetricCard label="Portfolio value" value={formatIxD(portfolioValue)} />
        <MetricCard label="Cash" value={formatIxD(cash)} />
        <MetricCard label="Holdings" value={formatIxD(holdingsValue)} />
        <MetricCard
          label="Return"
          value={formatPercent(returnPct)}
          sub={formatIxD(profit)}
          tone={profit >= 0 ? "positive" : "negative"}
        />
      </div>

      {chartData.length > 0 ? (
        <Card>
          <CardHeader className="px-4 py-3">
            <CardTitle>Holdings allocation</CardTitle>
            <p className="text-xs text-hx-muted">Values by ticker</p>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <PriceChart data={chartData} height={200} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="px-4 py-3">
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {holdings.length === 0 ? (
            <EmptyState
              title="No holdings yet"
              description="Buy fictional shares from the market to fill your portfolio."
              compact
              className="py-6"
              action={
                <Link
                  href="/market"
                  className="text-sm font-medium text-hx-link hover:underline"
                >
                  Explore Market
                </Link>
              }
            />
          ) : (
            <>
              <ul className="divide-y divide-hx-border md:hidden">
                {holdings.map((holding) => {
                  const product = holding.product;
                  if (!product) return null;
                  return (
                    <li key={holding.id}>
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
                            {formatShares(holding.shares)} sh · avg $
                            {formatPrice(holding.averageCost)}
                          </p>
                        </div>
                        <div className="shrink-0 space-y-0.5 text-right">
                          <p className="font-mono-num text-sm font-semibold text-hx-text">
                            {formatIxD(holding.value ?? 0)}
                          </p>
                          <ChangeBadge value={holding.returnPct ?? 0} />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-hx-border bg-hx-bg/50 text-[11px] font-medium uppercase tracking-wide text-hx-muted">
                      <th className="px-4 py-2.5 font-medium">Product</th>
                      <th className="px-2 py-2.5 text-right font-medium">Shares</th>
                      <th className="px-2 py-2.5 text-right font-medium">Avg cost</th>
                      <th className="px-2 py-2.5 text-right font-medium">Price</th>
                      <th className="px-2 py-2.5 text-right font-medium">Value</th>
                      <th className="px-4 py-2.5 text-right font-medium">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => {
                      const product = holding.product;
                      if (!product) return null;
                      return (
                        <tr
                          key={holding.id}
                          className="border-b border-hx-border last:border-0 hover:bg-hx-bg/40"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/market/${product.slug}`}
                              className="flex items-center gap-2.5"
                            >
                              <ProductLogo
                                name={product.name}
                                logoUrl={product.logoUrl}
                                domain={product.domain}
                                size="md"
                              />
                              <div>
                                <p className="text-sm font-medium text-hx-text">
                                  {product.name}
                                </p>
                                <p className="font-mono-num text-[10px] text-hx-muted">
                                  ${product.ticker}
                                </p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-2 py-3 text-right font-mono-num text-sm">
                            {formatShares(holding.shares)}
                          </td>
                          <td className="px-2 py-3 text-right font-mono-num text-sm">
                            ${formatPrice(holding.averageCost)}
                          </td>
                          <td className="px-2 py-3 text-right font-mono-num text-sm">
                            ${formatPrice(product.currentPrice)}
                          </td>
                          <td className="px-2 py-3 text-right font-mono-num text-sm">
                            {formatIxD(holding.value ?? 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <ChangeBadge value={holding.returnPct ?? 0} />
                            <p className="font-mono-num text-[11px] text-hx-muted">
                              {formatIxD(holding.pnl ?? 0)}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col justify-center px-3 py-3 sm:px-4 sm:py-3.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-hx-muted">
          {label}
        </p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p
            className={`font-mono-num text-lg font-semibold leading-none sm:text-xl ${
              tone === "positive"
                ? "text-hx-positive"
                : tone === "negative"
                  ? "text-hx-negative"
                  : "text-hx-text"
            }`}
          >
            {value}
          </p>
          {sub ? (
            <p className="font-mono-num text-xs leading-none text-hx-muted">{sub}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
