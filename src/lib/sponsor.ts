export const CONTACT_EMAIL = "contact@hypexchange.space";

export const SPONSOR_STARTING_PRICE = 5;

/** Demo bids shown on the homepage sponsor slot. */
export const SAMPLE_SPONSOR_BIDS = [
  { name: "Orbit Analytics", amount: 14, note: "2h ago" },
  { name: "Pixel Foundry", amount: 11, note: "5h ago" },
  { name: "Stacklane", amount: 8, note: "9h ago" },
  { name: "Northwind AI", amount: 6, note: "12h ago" },
] as const;

export type FounderOfferId = "sponsor" | "ipo";

export const FOUNDER_OFFERS: {
  id: FounderOfferId;
  title: string;
  eyebrow: string;
  price: string;
  summary: string;
  perks: string[];
  cta: string;
  href: string;
}[] = [
  {
    id: "sponsor",
    title: "Sponsor Placement",
    eyebrow: "Homepage",
    price: "from $5/day",
    summary: "Get your startup featured in the homepage sponsor slot.",
    perks: [
      "Appear in the sponsor slot for 24 hours",
      "Link directly to your product",
      "Visible to all visitors",
      "Ideal for launches or promotions",
    ],
    cta: "Sponsor this spot",
    href: "/sponsor/bid?offer=sponsor",
  },
  {
    id: "ipo",
    title: "Featured IPO Launch",
    eyebrow: "Listing",
    price: "$9–$19 one-time",
    summary: "Launch your startup as an IPO on HypeXchange with promo placement.",
    perks: [
      "Dedicated market page with ticker/symbol",
      "Featured in the IPO section",
      "Highlighted on homepage for launch day",
      "Shareable public market URL",
    ],
    cta: "Launch Your IPO",
    href: "/sponsor/bid?offer=ipo",
  },
];

export function offerLabel(id: string | null | undefined): string {
  const offer = FOUNDER_OFFERS.find((o) => o.id === id);
  return offer?.title ?? "Sponsor Placement";
}

/** Slot ends at the next local midnight (rolling 24h auction window). */
export function getSponsorSlotEnd(now = new Date()): Date {
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  if (end.getTime() <= now.getTime()) {
    end.setDate(end.getDate() + 1);
  }
  return end;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0h 0m";
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}
