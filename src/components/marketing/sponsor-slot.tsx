"use client";

import * as React from "react";
import Link from "next/link";
import {
  SAMPLE_SPONSOR_BIDS,
  SPONSOR_STARTING_PRICE,
  formatCountdown,
  getSponsorSlotEnd,
} from "@/lib/sponsor";
import { cn } from "@/lib/utils";

export function SponsorSlot({ className }: { className?: string }) {
  const [remaining, setRemaining] = React.useState(() =>
    Math.max(0, getSponsorSlotEnd().getTime() - Date.now()),
  );

  React.useEffect(() => {
    function tick() {
      setRemaining(Math.max(0, getSponsorSlotEnd().getTime() - Date.now()));
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const topBid = SAMPLE_SPONSOR_BIDS[0]?.amount ?? SPONSOR_STARTING_PRICE;

  return (
    <section
      className={cn(
        "rounded-[10px] border border-hx-border bg-hx-card px-3.5 py-3 sm:px-4",
        className,
      )}
      aria-label="Homepage sponsor spot"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-muted">
              Sponsor
            </p>
            <h2 className="text-sm font-semibold tracking-tight text-hx-text">
              Advertise here for 24 hours
            </h2>
          </div>
          <p className="text-[12px] leading-snug text-hx-secondary">
            From{" "}
            <span className="font-medium text-hx-text">
              ${SPONSOR_STARTING_PRICE}/day
            </span>
            <span className="text-hx-border"> · </span>
            Ends{" "}
            <span className="font-mono-num font-medium text-hx-text">
              {formatCountdown(remaining)}
            </span>
            <span className="text-hx-border"> · </span>
            Top{" "}
            <span className="font-mono-num font-medium text-hx-text">
              ${topBid}/day
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/sponsor/bid"
            className="btn-raised inline-flex h-8 items-center justify-center rounded-[8px] px-3 text-xs font-medium"
          >
            Place a Bid
          </Link>
          <Link
            href="/founders"
            className="inline-flex h-8 items-center justify-center rounded-[8px] border border-hx-border px-3 text-xs font-medium text-hx-secondary hover:bg-hx-bg hover:text-hx-text"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}
