import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "HypeXchange disclaimer: fictional market, no real money, no equity, entertainment only.",
};

const CONTACT = "contact@hypexchange.space";

export default function DisclaimerPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 py-2">
      <h1 className="text-2xl font-semibold tracking-tight text-hx-text">Disclaimer</h1>
      <div className="space-y-4 text-sm leading-relaxed text-hx-secondary [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-hx-text [&_a]:text-hx-link [&_a]:underline">
        <p>
          HypeXchange is a fictional stock exchange for internet products. It exists for
          entertainment, education about market mechanics in a playful setting, and social
          competition with fake money.
        </p>
        <h2>No real money</h2>
        <p>
          IXD is not legal tender, a stablecoin, a gift card, or a store of value. You
          cannot buy, sell, deposit, or withdraw IXD for real currency. Any balance shown
          is for gameplay only.
        </p>
        <h2>No real equity</h2>
        <p>
          Buying or selling “shares” does not create ownership, voting rights, dividends,
          equity, tokens, or any claim against the named companies or products. Brands and
          product names appear as cultural references in a simulated market.
        </p>
        <h2>Not financial advice</h2>
        <p>
          Charts, prices, leaderboards, and “IPO” language are simulated. Do not treat
          anything on this site as investment research, a recommendation, or a signal about
          real markets.
        </p>
        <h2>No deposits or withdrawals</h2>
        <p>
          HypeXchange does not accept deposits and does not pay out winnings. If anyone
          claims otherwise, they are not acting for this platform.
        </p>
        <h2>Use at your own risk</h2>
        <p>
          Game state may change, reset, or contain errors. We are not liable for decisions
          you make based on fictional prices or rankings.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about this disclaimer:{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </div>
    </article>
  );
}
