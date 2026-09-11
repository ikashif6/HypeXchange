import type { Metadata } from "next";
import Link from "next/link";
import { IpoRequestForm } from "@/app/sponsor/ipo/ipo-form";
import { IPO_LAUNCH_PRICE } from "@/lib/sponsor";

export const metadata: Metadata = {
  title: "Featured IPO launch",
  description: "Request a featured IPO listing on HypeXchange.",
};

export default function SponsorIpoPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-muted">
          Featured IPO
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
          Launch as a featured IPO
        </h1>
        <p className="text-sm leading-relaxed text-hx-secondary">
          ${IPO_LAUNCH_PRICE} one-time for a dedicated market page and launch-day
          placement.{" "}
          <Link href="/founders" className="font-medium text-hx-link hover:underline">
            View all founder offers
          </Link>
          .
        </p>
      </div>

      <IpoRequestForm />
    </div>
  );
}
