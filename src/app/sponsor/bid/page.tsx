import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SponsorBidForm } from "@/app/sponsor/bid/bid-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Place a bid",
  description:
    "Bid on HypeXchange homepage sponsorship or IPO launch placement.",
};

export default function SponsorBidPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-muted">
          Advertising
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
          Bid on a founder spot
        </h1>
        <p className="text-sm leading-relaxed text-hx-secondary">
          Tell us who you are and how much you want to bid. We will follow up by
          email.{" "}
          <Link href="/founders" className="font-medium text-hx-link hover:underline">
            View all founder offers
          </Link>
          .
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-[32rem] w-full rounded-[14px]" />}>
        <SponsorBidForm />
      </Suspense>
    </div>
  );
}
