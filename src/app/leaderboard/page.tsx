import Link from "next/link";
import {
  getLeaderboard,
  type LeaderboardPeriod,
} from "@/lib/market/queries";
import { formatIxD, formatPercent } from "@/lib/formatting/decimal";
import { absoluteUrl, cn, leaderboardShareContent } from "@/lib/utils";
import { ShareMenu } from "@/components/ui/share-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProfilePublic } from "@/types";

const TABS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "30d", label: "30D" },
  { id: "7d", label: "7D" },
];

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const periodRaw = (first(sp.period) as LeaderboardPeriod | undefined) ?? "overall";
  const period = TABS.some((t) => t.id === periodRaw) ? periodRaw : "overall";
  const periodLabel = TABS.find((t) => t.id === period)?.label ?? "Overall";

  let leaders: ProfilePublic[] = [];
  try {
    leaders = await getLeaderboard(period, 50);
  } catch {
    leaders = [];
  }

  const shareContent = leaderboardShareContent({
    url: absoluteUrl(
      period === "overall" ? "/leaderboard" : `/leaderboard?period=${period}`,
    ),
    periodLabel,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
            Leaderboard
          </h1>
          <p className="text-sm text-hx-secondary">
            Traders are ranked by fictional portfolio return from a starting balance of
            10,000 IXD.
          </p>
        </div>
        <ShareMenu
          content={shareContent}
          variant="dropdown"
          buttonLabel="Share"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "overall" ? "/leaderboard" : `/leaderboard?period=${tab.id}`}
            className={cn("hx-chip", period === tab.id && "hx-chip-active")}
            data-active={period === tab.id || undefined}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {leaders.length === 0 ? (
            <EmptyState
              title="No traders ranked yet"
              description="Trades will populate the leaderboard once the market is live."
              compact
            />
          ) : (
            <>
              <ul className="divide-y divide-hx-border md:hidden">
                {leaders.map((profile) => (
                  <li key={profile.id}>
                    <Link
                      href={`/u/${profile.username}`}
                      className="flex items-center gap-3 px-3 py-3.5 transition-colors hover:bg-hx-bg/70 sm:px-4"
                    >
                      <span className="w-7 shrink-0 font-mono-num text-xs text-hx-muted">
                        #{profile.rank ?? "-"}
                      </span>
                      <UserAvatar
                        username={profile.username}
                        displayName={profile.displayName}
                        avatarUrl={profile.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-hx-text">
                          {profile.displayName}
                        </p>
                        <p className="truncate text-[11px] text-hx-muted">
                          @{profile.username} · {profile.tradeCount ?? 0} trades
                        </p>
                      </div>
                      <div className="shrink-0 space-y-0.5 text-right">
                        <p className="font-mono-num text-sm font-semibold text-hx-text">
                          {formatIxD(profile.portfolioValue ?? 0)}
                        </p>
                        <p
                          className={`font-mono-num text-[11px] font-medium ${
                            (profile.returnPct ?? 0) >= 0
                              ? "text-hx-positive"
                              : "text-hx-negative"
                          }`}
                        >
                          {formatPercent(profile.returnPct ?? 0)}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-hx-border bg-hx-bg/50 text-[11px] font-medium uppercase tracking-wide text-hx-muted">
                      <th className="px-4 py-2.5 font-medium">Rank</th>
                      <th className="px-2 py-2.5 font-medium">Trader</th>
                      <th className="px-2 py-2.5 text-right font-medium">Portfolio</th>
                      <th className="px-2 py-2.5 text-right font-medium">Return</th>
                      <th className="px-4 py-2.5 text-right font-medium">Trades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaders.map((profile) => (
                      <tr
                        key={profile.id}
                        className="border-b border-hx-border last:border-0 hover:bg-hx-bg/40"
                      >
                        <td className="px-4 py-3 font-mono-num text-sm text-hx-muted">
                          #{profile.rank ?? "-"}
                        </td>
                        <td className="px-2 py-3">
                          <Link
                            href={`/u/${profile.username}`}
                            className="flex items-center gap-2.5"
                          >
                            <UserAvatar
                              username={profile.username}
                              displayName={profile.displayName}
                              avatarUrl={profile.avatarUrl}
                              size="sm"
                            />
                            <div>
                              <p className="text-sm font-medium text-hx-text">
                                {profile.displayName}
                              </p>
                              <p className="text-[11px] text-hx-muted">@{profile.username}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-right font-mono-num text-sm">
                          {formatIxD(profile.portfolioValue ?? 0)}
                        </td>
                        <td
                          className={`px-2 py-3 text-right font-mono-num text-sm font-medium ${
                            (profile.returnPct ?? 0) >= 0
                              ? "text-hx-positive"
                              : "text-hx-negative"
                          }`}
                        >
                          {formatPercent(profile.returnPct ?? 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono-num text-sm text-hx-muted">
                          {profile.tradeCount ?? 0}
                        </td>
                      </tr>
                    ))}
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
