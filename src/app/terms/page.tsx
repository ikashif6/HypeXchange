import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "HypeXchange terms: entertainment only, no real money or equity.",
};

const CONTACT = "contact@hypexchange.space";
const UPDATED = "September 11, 2026";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated={UPDATED}>
      <p>
        These Terms of Service (“Terms”) govern your access to and use of HypeXchange
        (“HypeXchange”, “we”, “us”, or “our”), including our website, accounts, APIs,
        emails, and related features (together, the “Service”). By creating an account,
        signing in, or using the Service, you agree to these Terms. If you do not agree,
        do not use the Service.
      </p>
      <p>
        HypeXchange is an entertainment website and game where users trade fictional
        shares of internet products using a fictional currency called IXD. Please also
        read our{" "}
        <a href="/privacy">Privacy Policy</a> and{" "}
        <a href="/disclaimer">Disclaimer</a>, which are incorporated by reference.
      </p>

      <h2>1. What HypeXchange is</h2>
      <p>
        HypeXchange simulates a stock-market experience for cultural and entertainment
        purposes. Users may receive fictional IXD, buy and sell fictional “shares” of
        listed internet products, view charts and leaderboards, request listings, and
        share profiles within the app.
      </p>
      <p>
        The Service is designed as a game and parody of market culture. Product names,
        brand names, tickers, “IPO” language, and portfolio values are part of that
        simulation. They are not statements about real-world valuation, fundraising, or
        ownership.
      </p>

      <h2>2. Entertainment only — not a financial product</h2>
      <p>HypeXchange is not, and must not be treated as:</p>
      <ul>
        <li>an offer to sell or buy securities, commodities, or derivatives;</li>
        <li>investment, tax, legal, or trading advice;</li>
        <li>a broker-dealer, exchange, ATS, bank, wallet, or money transmitter;</li>
        <li>a crowdfunding, fundraising, or equity issuance platform; or</li>
        <li>a prediction market for real-money outcomes.</li>
      </ul>
      <p>
        Nothing on the Service constitutes a solicitation to invest in any company or
        product. You are solely responsible for any real-world decisions you make. Do
        not rely on HypeXchange for financial decisions.
      </p>

      <h2>3. No real money, deposits, or withdrawals</h2>
      <p>
        IXD has no cash value. You cannot deposit, withdraw, transfer, sell, gift for
        value, or redeem IXD for real currency, cryptocurrency, gift cards, goods, or
        services. There are no bank deposits, payment rails for cash-out, or “winnings”
        payouts.
      </p>
      <p>
        If anyone claims they can convert IXD to money, or asks you to send real funds
        related to HypeXchange balances, they are not acting for us. Report abuse to{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>
      <p>
        Optional promotional placements described on our founders or sponsorship pages
        (such as homepage bids) are separate advertising inquiries and are not purchases
        of IXD, shares, or investment products.
      </p>

      <h2>4. No equity or ownership</h2>
      <p>
        “Shares,” tickers, holdings, and portfolio values on HypeXchange do not represent
        equity, tokens, dividends, voting rights, intellectual property rights, domain
        rights, or any claim against any real company, founder, or product. Brands and
        product names appear as cultural references in a simulated market.
      </p>
      <p>
        Listing a product, featuring a sponsor, or labeling something an “IPO” does not
        mean the named company endorses HypeXchange, participates in the Service, or has
        any relationship with us unless we expressly say so in writing.
      </p>

      <h2>5. Eligibility and accounts</h2>
      <p>
        You must be able to form a binding contract in your jurisdiction to use the
        Service. You may not use the Service if you are prohibited from doing so under
        applicable law.
      </p>
      <p>
        You sign in with an email magic link. You are responsible for keeping access to
        your email secure and for all activity under your account. Do not share one-time
        sign-in links. Provide accurate information and keep your profile appropriate for
        a public entertainment app.
      </p>
      <p>We may refuse registration, limit features, or close accounts that:</p>
      <ul>
        <li>abuse, disrupt, or attempt to hack the Service;</li>
        <li>attempt to monetize IXD or invent unauthorized cash-out schemes;</li>
        <li>misrepresent HypeXchange as a real securities market or investment product;</li>
        <li>harass others, spam, or post unlawful or infringing content; or</li>
        <li>violate these Terms or our other policies.</li>
      </ul>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>scrape, overload, or reverse engineer the Service except as allowed by law;</li>
        <li>interfere with other users’ accounts or the integrity of gameplay data;</li>
        <li>use bots in a way that harms the experience for others without our permission;</li>
        <li>
          upload malware, or attempt unauthorized access to our systems or third-party
          services we rely on;
        </li>
        <li>
          use HypeXchange trademarks, logos, or layout to impersonate us or confuse the
          public about what the Service is; or
        </li>
        <li>
          use the Service to promote real-money gambling, illegal activity, or fraudulent
          investment schemes.
        </li>
      </ul>

      <h2>7. User content and listing requests</h2>
      <p>
        If you submit listing requests, profile text, messages, bids, or other content
        (“User Content”), you grant us a worldwide, non-exclusive, royalty-free license to
        host, display, moderate, and use that content to operate and promote the Service.
        You represent that you have the rights needed to submit it and that it does not
        infringe others’ rights.
      </p>
      <p>
        We may edit, reject, delay, or remove User Content and product listings for any
        reason, including gameplay balance, brand risk, or legal concerns. Submission does
        not guarantee listing or featured placement.
      </p>

      <h2>8. Promotional placements and founder offers</h2>
      <p>
        From time to time we may offer promotional spots such as homepage sponsorship or
        featured IPO-style visibility. Bidding or inquiry forms may open your email client
        to contact us. Those communications are requests, not completed purchases, until
        we confirm otherwise in writing.
      </p>
      <p>
        Promotional placements buy attention and presentation on the Service. They do not
        buy fake trades, guaranteed price moves, fabricated “highest purchases,” or any
        real-world equity outcome.
      </p>

      <h2>9. Availability, changes, and “as is” service</h2>
      <p>
        We may modify, suspend, or discontinue any part of the Service at any time. Prices,
        pools, balances, ranks, history, and UI may be reset, corrected, or removed for
        gameplay, anti-abuse, maintenance, or operational reasons.
      </p>
      <p>
        THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OF ANY KIND,
        WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY
        LAW.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, HYPEXCHANGE AND ITS OPERATORS, AFFILIATES,
        AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA,
        GOODWILL, OR FICTIONAL GAME VALUE, ARISING FROM YOUR USE OF THE SERVICE.
      </p>
      <p>
        OUR TOTAL LIABILITY FOR ANY CLAIM RELATED TO THE SERVICE WILL NOT EXCEED THE GREATER
        OF (A) THE AMOUNTS YOU PAID US SPECIFICALLY FOR A CONFIRMED PROMOTIONAL PLACEMENT IN
        THE THREE MONTHS BEFORE THE CLAIM, OR (B) USD $50, IF YOU HAVE NOT PAID US.
      </p>
      <p>
        Some jurisdictions do not allow certain limitations. In those cases, our liability
        is limited to the fullest extent permitted.
      </p>

      <h2>11. Indemnity</h2>
      <p>
        You will defend and indemnify HypeXchange and its operators against claims, losses,
        and expenses (including reasonable attorneys’ fees) arising from your User Content,
        your misuse of the Service, your misrepresentation of the Service as a real market,
        or your violation of these Terms or applicable law.
      </p>

      <h2>12. Intellectual property</h2>
      <p>
        The Service’s software, design, copy, and branding (excluding third-party marks used
        in the simulation) are owned by us or our licensors. You may not copy or exploit
        them except as needed to use the Service as intended.
      </p>
      <p>
        Third-party names and logos appear for identification and entertainment context.
        All trademarks remain the property of their respective owners.
      </p>

      <h2>13. Privacy</h2>
      <p>
        Our collection and use of personal information is described in the{" "}
        <a href="/privacy">Privacy Policy</a>. By using the Service, you acknowledge that
        policy.
      </p>

      <h2>14. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access
        immediately if you violate these Terms or if we discontinue the Service. Provisions
        that by nature should survive (including disclaimers, limitations, and indemnity)
        will survive termination.
      </p>

      <h2>15. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. The “Last updated” date at the top
        will change when we do. Continued use after updates means you accept the revised
        Terms. If a change is material, we may also provide additional notice in the app or
        by email when practical.
      </p>

      <h2>16. Governing law</h2>
      <p>
        These Terms are governed by the laws applicable in the jurisdiction where the
        Service operators primarily manage the Service, without regard to conflict-of-law
        rules, except where mandatory consumer protections in your country require
        otherwise. Courts in that jurisdiction will have exclusive venue for disputes,
        subject to those mandatory protections.
      </p>

      <h2>17. Contact</h2>
      <p>
        Questions about these Terms:{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </p>
    </LegalLayout>
  );
}

function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl space-y-4 py-2">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-hx-text">{title}</h1>
        <p className="mt-1 text-xs text-hx-muted">Last updated: {updated}</p>
      </div>
      <div
        className={[
          "space-y-4 text-sm leading-relaxed text-hx-secondary",
          "[&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-hx-text",
          "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
          "[&_a]:text-hx-link [&_a]:underline",
        ].join(" ")}
      >
        {children}
      </div>
    </article>
  );
}
