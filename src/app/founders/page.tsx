import type { Metadata } from "next";
import Link from "next/link";
import { FOUNDER_OFFERS } from "@/lib/sponsor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Founder offers",
  description:
    "Sponsor the homepage or launch a featured IPO on HypeXchange.",
};

export default function FoundersPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-muted">
          For founders
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
          Grow with HypeXchange
        </h1>
        <p className="text-sm leading-relaxed text-hx-secondary">
          Bid on homepage sponsorship or launch as a featured IPO. These are
          promotional placements. They do not create fake trades or manipulate market
          activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FOUNDER_OFFERS.map((offer) => (
          <Card key={offer.id} className="flex flex-col overflow-hidden">
            <CardHeader className="space-y-2 border-b-0 px-5 pt-5 pb-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-muted">
                {offer.eyebrow}
              </p>
              <CardTitle className="text-base sm:text-lg">{offer.title}</CardTitle>
              <p className="font-mono-num text-sm font-semibold text-hx-text">
                {offer.price}
              </p>
              <p className="text-sm leading-relaxed text-hx-secondary">
                {offer.summary}
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-5 pt-4">
              <ul className="space-y-2 text-sm text-hx-secondary">
                {offer.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-hx-primary" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={offer.href}
                className="btn-raised mt-auto inline-flex h-10 w-full items-center justify-center rounded-[9px] text-sm font-medium"
              >
                {offer.cta}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-hx-secondary">
        Questions? Email{" "}
        <a
          href="mailto:contact@hypexchange.space"
          className="font-medium text-hx-link hover:underline"
        >
          contact@hypexchange.space
        </a>
        .
      </p>
    </div>
  );
}
