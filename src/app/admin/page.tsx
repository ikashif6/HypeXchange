import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { ListingRequest, Product } from "@/models";
import { getRecentTrades } from "@/lib/market/queries";
import { formatIxD, formatPrice, formatShares } from "@/lib/formatting/decimal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminPanels } from "@/app/admin/admin-panels";
import type { TradePublic } from "@/types";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }
  if (session.user.role !== "admin") {
    return (
      <div className="mx-auto max-w-md py-16">
        <EmptyState
          title="Admin only"
          description="Your account does not have admin access."
          action={
            <Link href="/" className="text-sm font-medium text-hx-link hover:underline">
              Back to dashboard
            </Link>
          }
        />
      </div>
    );
  }

  let productCount = 0;
  let pendingRequests: Array<{
    id: string;
    productName: string;
    domain: string;
    suggestedTicker: string;
    category: string;
    description: string;
    createdAt: string;
  }> = [];
  let recentTrades: TradePublic[] = [];
  let products: Array<{
    id: string;
    name: string;
    ticker: string;
    slug: string;
    status: string;
    currentPrice: number;
  }> = [];

  try {
    await connectMongo();
    const [count, pending, trades, productRows] = await Promise.all([
      Product.countDocuments({}),
      ListingRequest.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      getRecentTrades(20),
      Product.find({})
        .sort({ updatedAt: -1 })
        .limit(30)
        .select({ name: 1, ticker: 1, slug: 1, status: 1, currentPrice: 1 })
        .lean(),
    ]);
    productCount = count;
    recentTrades = trades;
    pendingRequests = pending.map((row) => ({
      id: row._id.toString(),
      productName: row.productName,
      domain: row.domain,
      suggestedTicker: row.suggestedTicker,
      category: row.category,
      description: row.description ?? "",
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt ?? ""),
    }));
    products = productRows.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      ticker: p.ticker,
      slug: p.slug,
      status: p.status,
      currentPrice: Number(p.currentPrice?.toString?.() ?? p.currentPrice ?? 0),
    }));
  } catch {
    // empty admin fallback during build / missing DB
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
          Admin
        </h1>
        <p className="text-sm text-hx-secondary">
          Manage fictional products, listing requests, and review recent trades.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard label="Products" value={String(productCount)} href="#products" />
        <SummaryCard
          label="Pending listings"
          value={String(pendingRequests.length)}
          href="#listings"
        />
        <SummaryCard
          label="Recent trades"
          value={String(recentTrades.length)}
          href="#trades"
        />
      </div>

      <section id="trades" className="space-y-3">
        <h2 className="text-sm font-semibold text-hx-text">Recent trades</h2>
        <Card>
          <CardContent className="p-0">
            {recentTrades.length === 0 ? (
              <EmptyState title="No trades" compact />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-hx-border bg-hx-bg/50 text-[11px] uppercase tracking-wide text-hx-muted">
                      <th className="px-3 py-2 font-medium">Side</th>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 text-right font-medium">Shares</th>
                      <th className="px-3 py-2 text-right font-medium">Amount</th>
                      <th className="px-3 py-2 text-right font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrades.map((trade) => (
                      <tr key={trade.id} className="border-b border-hx-border last:border-0">
                        <td className="px-3 py-2 capitalize">{trade.side}</td>
                        <td className="px-3 py-2">
                          {trade.product ? (
                            <Link
                              href={`/market/${trade.product.slug}`}
                              className="hover:text-hx-link"
                            >
                              ${trade.product.ticker}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-mono-num">
                          {formatShares(trade.shares)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono-num">
                          {formatIxD(trade.cashAmount)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono-num">
                          ${formatPrice(trade.priceAfter)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <AdminPanels pendingRequests={pendingRequests} products={products} />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a href={href}>
      <Card className="transition-colors hover:border-hx-primary/30">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-xs uppercase tracking-wide text-hx-muted">
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="font-mono-num text-2xl font-semibold text-hx-text">{value}</p>
        </CardContent>
      </Card>
    </a>
  );
}
