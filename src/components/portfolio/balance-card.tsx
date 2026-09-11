import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, Bookmark, LayoutGrid, Wallet } from "lucide-react";
import { formatIxD } from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface BalanceCardProps {
  cashBalance: number;
  className?: string;
  exploreHref?: string;
}

export function BalanceCard({
  cashBalance,
  className,
  exploreHref = "/market",
}: BalanceCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-hx-muted">
              My Balance
            </p>
            <p className="mt-1 font-mono-num text-2xl font-semibold tracking-tight text-hx-text sm:text-3xl">
              {formatIxD(cashBalance)}
            </p>
            <p className="mt-1 text-xs text-hx-secondary">Available Cash</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-[9px] bg-hx-primary-subtle text-hx-primary">
            <Wallet className="size-4" aria-hidden />
          </div>
        </div>

        <Link
          href={exploreHref}
          className="btn-raised inline-flex h-11 w-full items-center justify-center rounded-[9px] text-sm font-medium transition-colors"
        >
          Explore Market
        </Link>

        <div className="grid grid-cols-3 gap-2">
          <QuickLink href="/portfolio" icon={<LayoutGrid className="size-3.5" />} label="Portfolio" />
          <QuickLink href="/watchlist" icon={<Bookmark className="size-3.5" />} label="Watchlist" />
          <QuickLink href="/" icon={<Activity className="size-3.5" />} label="Activity" />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex flex-col items-center gap-1 rounded-[9px] border border-hx-border bg-hx-card px-2 py-2.5 text-[11px] font-medium text-hx-secondary transition-colors hover:bg-hx-bg hover:text-hx-text"
    >
      {icon}
      {label}
    </Link>
  );
}
