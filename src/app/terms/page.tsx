import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "HypeXchange terms: entertainment only, no real money or equity.",
};

const CONTACT = "contact@hypexchange.space";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p>
        HypeXchange (“we”, “us”) provides an entertainment website where users can trade
        fictional shares of internet products using a fictional currency called IXD.
      </p>
      <h2>Entertainment only</h2>
      <p>
        HypeXchange is a game and simulation. Nothing on this site is an offer to sell
        securities, investment advice, a brokerage service, or a financial product.
      </p>
      <h2>No real money</h2>
      <p>
        IXD has no cash value. You cannot deposit, withdraw, transfer, or redeem IXD for
        real currency, cryptocurrency, or anything of value. There are no deposits or
        withdrawals.
      </p>
      <h2>No equity or ownership</h2>
      <p>
        “Shares” on HypeXchange do not represent equity, tokens, claims, or ownership in
        any real company, product, domain, or intellectual property. Company names and
        brands are used for entertainment and parody of market culture only.
      </p>
      <h2>Accounts</h2>
      <p>
        You are responsible for activity under your account. We may suspend or remove
        accounts that abuse the service, attempt to monetize IXD, or misrepresent the
        platform as a real market.
      </p>
      <h2>Availability</h2>
      <p>
        The service is provided “as is” without warranties. Prices, balances, and history
        may be reset, corrected, or removed at any time for gameplay or operational
        reasons.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </p>
    </LegalLayout>
  );
}

function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl space-y-4 py-2">
      <h1 className="text-2xl font-semibold tracking-tight text-hx-text">{title}</h1>
      <div className="space-y-4 text-sm leading-relaxed text-hx-secondary [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-hx-text [&_a]:text-hx-link [&_a]:underline">
        {children}
      </div>
    </article>
  );
}
