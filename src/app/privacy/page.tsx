import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How HypeXchange handles account and usage data for this entertainment app.",
};

const CONTACT = "contact@hypexchange.space";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4 py-2">
      <h1 className="text-2xl font-semibold tracking-tight text-hx-text">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-relaxed text-hx-secondary [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-hx-text [&_a]:text-hx-link [&_a]:underline">
        <p>
          HypeXchange is an entertainment application. This policy explains what limited
          information we process to operate accounts and the fictional market.
        </p>
        <h2>Information we collect</h2>
        <p>
          Depending on how you sign in, we may store your email address, display name,
          profile image URL, username, fictional IXD balances, holdings, watchlist entries,
          trades, and listing requests. Authentication is handled via email magic links
          (Resend) and session storage in our database.
        </p>
        <h2>How we use information</h2>
        <p>
          We use account data to authenticate you, run the simulation (balances, trades,
          leaderboards), moderate listing requests, and improve reliability. We do not sell
          personal data. We do not process real-money payments because the product has no
          deposits or withdrawals.
        </p>
        <h2>Public profiles</h2>
        <p>
          Usernames, display names, avatars, and leaderboard stats may be public within the
          app. Do not share sensitive personal information in display names or listing
          requests.
        </p>
        <h2>Retention</h2>
        <p>
          We retain account and gameplay records while your account exists or as needed to
          operate and secure the service. You may request account deletion by emailing{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
        <h2>Security</h2>
        <p>
          We use reasonable technical measures to protect account data, but no online
          service is perfectly secure. Sign-in links expire and should not be shared.
        </p>
        <h2>Entertainment disclaimer</h2>
        <p>
          Portfolio values, prices, and IXD balances are fictional and have no real-world
          monetary value. Nothing in this policy creates investment, banking, or brokerage
          obligations.
        </p>
        <h2>Contact</h2>
        <p>
          Privacy questions:{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </div>
    </article>
  );
}
