import Link from "next/link";
import { auth } from "@/auth";
import { getWatchlist } from "@/lib/market/queries";
import { MarketTable } from "@/components/market/market-table";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProductPublic } from "@/types";
import { WatchlistActions } from "@/app/watchlist/watchlist-actions";

export default async function WatchlistPage() {
  const session = await auth();
  const profileId = session?.user?.profileId;

  if (!profileId) {
    return (
      <div className="mx-auto max-w-md py-16">
        <EmptyState
          title="Sign in to use watchlist"
          description="Save products you want to track and trade later."
          action={
            <Link
              href="/auth/signin?callbackUrl=/watchlist"
              className="btn-raised inline-flex h-10 items-center justify-center rounded-[9px] px-4 text-sm font-medium"
            >
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  let products: ProductPublic[] = [];
  try {
    products = await getWatchlist(profileId);
  } catch {
    products = [];
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
            Watchlist
          </h1>
          <p className="text-sm text-hx-secondary">
            Products you are tracking on the fictional hype market.
          </p>
        </div>
        <Link
          href="/market"
          className="text-sm font-medium text-hx-link hover:underline"
        >
          Browse market
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Watchlist is empty"
          description="Open a product page and add it to your watchlist."
          action={
            <Link
              href="/market"
              className="btn-raised inline-flex h-9 items-center justify-center rounded-[9px] px-3.5 text-sm font-medium"
            >
              Explore Market
            </Link>
          }
        />
      ) : (
        <>
          <MarketTable products={products} searchable />
          <WatchlistActions products={products} />
        </>
      )}
    </div>
  );
}
