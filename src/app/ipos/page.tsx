import Link from "next/link";
import { getIpoProducts } from "@/lib/market/queries";
import { formatPrice } from "@/lib/formatting/decimal";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProductPublic } from "@/types";

export default async function IposPage() {
  let upcoming: ProductPublic[] = [];
  let newListings: ProductPublic[] = [];

  try {
    const result = await getIpoProducts();
    upcoming = result.upcoming;
    newListings = result.newListings;
  } catch {
    upcoming = [];
    newListings = [];
  }

  const live = newListings.filter((p) => p.status === "active");
  const neu = [...newListings].sort(
    (a, b) => new Date(b.listedAt ?? b.createdAt).getTime() - new Date(a.listedAt ?? a.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
          IPOs
        </h1>
        <p className="text-sm text-hx-secondary">
          See new and upcoming fictional listings on the hype market.
        </p>
      </div>

      <IpoSection
        title="Live"
        description="Recently listed products open for trading."
        products={live}
        empty="No live IPOs right now."
      />
      <IpoSection
        title="New"
        description="Fresh listings from the last 14 days."
        products={neu}
        empty="No new listings yet."
      />
      <IpoSection
        title="Upcoming"
        description="Products waiting to hit the market."
        products={upcoming}
        empty="No upcoming IPOs scheduled."
      />
    </div>
  );
}

function IpoSection({
  title,
  description,
  products,
  empty,
}: {
  title: string;
  description: string;
  products: ProductPublic[];
  empty: string;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-hx-secondary">
          {title}
        </h2>
        <p className="text-xs text-hx-muted">{description}</p>
      </div>
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <EmptyState title={empty} compact />
          ) : (
            <ul className="divide-y divide-hx-border">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/market/${product.slug}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-hx-bg/60"
                  >
                    <ProductLogo
                      name={product.name}
                      logoUrl={product.logoUrl}
                      domain={product.domain}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-hx-text">
                          {product.name}
                        </p>
                        <Badge variant="outline">{product.category}</Badge>
                        {product.status === "upcoming" ? (
                          <Badge variant="muted">Upcoming</Badge>
                        ) : null}
                      </div>
                      <p className="font-mono-num text-[11px] text-hx-muted">
                        ${product.ticker} · {product.domain}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-num text-sm font-semibold text-hx-text">
                        ${formatPrice(product.currentPrice)}
                      </p>
                      {product.status !== "upcoming" ? (
                        <ChangeBadge value={product.change24h} />
                      ) : (
                        <p className="text-[11px] text-hx-muted">Pre-market</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
