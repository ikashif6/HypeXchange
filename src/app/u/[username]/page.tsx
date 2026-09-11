import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  TrendingUp,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  getPortfolio,
  getProfileByUsername,
} from "@/lib/market/queries";
import {
  formatIxD,
  formatPercent,
  formatPrice,
  formatShares,
} from "@/lib/formatting/decimal";
import { absoluteUrl, cn, profileShareContent } from "@/lib/utils";
import { ShareMenu } from "@/components/ui/share-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";
import type { HoldingPublic } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  try {
    const profile = await getProfileByUsername(username);
    if (!profile) return { title: "Trader not found" };
    return {
      title: `${profile.displayName} (@${profile.username})`,
      description: `Public HypeXchange profile for @${profile.username}. Fictional IXD portfolio.`,
      openGraph: {
        title: `${profile.displayName} on HypeXchange`,
        url: absoluteUrl(`/u/${profile.username}`),
      },
    };
  } catch {
    return { title: "Profile" };
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let profile = null;
  try {
    profile = await getProfileByUsername(username);
  } catch {
    profile = null;
  }
  if (!profile) notFound();

  let holdings: HoldingPublic[] = [];
  let cash = profile.cashBalance;
  try {
    const portfolio = await getPortfolio(profile.id);
    holdings = [...portfolio.holdings]
      .filter((h) => h.product)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
      .slice(0, 8);
    cash = portfolio.cash;
  } catch {
    holdings = [];
  }

  const profileUrl = absoluteUrl(`/u/${profile.username}`);
  const shareContent = profileShareContent({
    url: profileUrl,
    displayName: profile.displayName,
    username: profile.username,
    portfolioValue: formatIxD(profile.portfolioValue ?? 0),
    returnPct: formatPercent(profile.returnPct ?? 0),
    tradeCount: profile.tradeCount ?? 0,
  });
  const joined = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const returnPct = profile.returnPct ?? 0;
  const positive = returnPct >= 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Profile header */}
      <section className="rounded-[14px] border border-hx-border bg-hx-card px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <UserAvatar
              username={profile.username}
              displayName={profile.displayName}
              avatarUrl={profile.avatarUrl}
              size="lg"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
                  {profile.displayName}
                </h1>
                {profile.rank ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-hx-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-hx-primary">
                    <Trophy className="size-3" aria-hidden />
                    Rank #{profile.rank}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-hx-muted">@{profile.username}</p>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-hx-secondary">
                <CalendarDays className="size-3.5 text-hx-muted" aria-hidden />
                Joined {joined}
              </p>
            </div>
          </div>
          <ShareMenu
            content={shareContent}
            variant="dropdown"
            buttonLabel="Share"
          />
        </div>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-hx-secondary">
          Public entertainment profile on HypeXchange. Values use fictional IXD and do
          not represent real money, equity, or ownership.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Wallet className="size-3.5" />}
          label="Portfolio"
          value={formatIxD(profile.portfolioValue ?? 0)}
        />
        <StatCard
          icon={<TrendingUp className="size-3.5" />}
          label="Return"
          value={formatPercent(returnPct)}
          tone={positive ? "positive" : "negative"}
        />
        <StatCard
          icon={<CircleDollarSign className="size-3.5" />}
          label="Profit"
          value={formatIxD(profile.profit ?? 0)}
          tone={(profile.profit ?? 0) >= 0 ? "positive" : "negative"}
        />
        <StatCard
          icon={<ArrowUpRight className="size-3.5" />}
          label="Trades"
          value={String(profile.tradeCount ?? 0)}
        />
      </div>

      {/* Cash + holdings */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
        <Card className="sm:self-start">
          <CardContent className="space-y-1 px-4 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-hx-muted">
              Cash
            </p>
            <p className="font-mono-num text-lg font-semibold text-hx-text">
              {formatIxD(cash)}
            </p>
            <p className="text-[11px] text-hx-muted">Available IXD</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-hx-border px-4 py-3">
            <CardTitle>Top holdings</CardTitle>
            <Link
              href="/market"
              className="text-xs font-medium text-hx-link hover:underline"
            >
              Market
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {holdings.length === 0 ? (
              <EmptyState
                title="No public holdings"
                description="This trader hasn’t opened positions yet, or the book is all cash."
                compact
              />
            ) : (
              <ul className="divide-y divide-hx-border">
                {holdings.map((holding) => {
                  const product = holding.product!;
                  return (
                    <li key={holding.id}>
                      <Link
                        href={`/market/${product.slug}`}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-hx-bg/70"
                      >
                        <ProductLogo
                          name={product.name}
                          logoUrl={product.logoUrl}
                          domain={product.domain}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-hx-text">
                            {product.name}
                          </p>
                          <p className="font-mono-num text-[11px] text-hx-muted">
                            {formatShares(holding.shares)} sh · $
                            {formatPrice(product.currentPrice)}
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
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-4 py-3">
          <CardTitle>About this profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-hx-secondary">
          <p>
            HypeXchange is an entertainment game. IXD has no monetary value. Virtual
            shares do not represent ownership of any company or product.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/leaderboard"
              className="inline-flex h-8 items-center rounded-[8px] border border-hx-border bg-hx-bg px-3 text-xs font-medium text-hx-text hover:border-hx-primary/30"
            >
              View leaderboard
            </Link>
            <Link
              href="/market"
              className="inline-flex h-8 items-center rounded-[8px] border border-hx-border bg-hx-bg px-3 text-xs font-medium text-hx-text hover:border-hx-primary/30"
            >
              Browse market
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <Card>
      <CardContent className="px-3.5 py-3.5">
        <div className="flex items-center gap-1.5 text-hx-muted">
          <span className="text-hx-muted">{icon}</span>
          <p className="text-[11px] font-medium uppercase tracking-wide">{label}</p>
        </div>
        <p
          className={cn(
            "mt-2 font-mono-num text-base font-semibold tabular-nums sm:text-lg",
            tone === "positive"
              ? "text-hx-positive"
              : tone === "negative"
                ? "text-hx-negative"
                : "text-hx-text",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
