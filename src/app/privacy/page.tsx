import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How HypeXchange handles account and usage data for this entertainment app.",
};

const CONTACT = "contact@hypexchange.space";
const UPDATED = "September 11, 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated={UPDATED}>
      <p>
        This Privacy Policy explains how HypeXchange (“we”, “us”, or “our”) collects, uses,
        stores, and shares information when you use our website and related features (the
        “Service”). HypeXchange is an entertainment application: a fictional market that
        uses IXD, a play currency with no cash value.
      </p>
      <p>
        By using the Service, you acknowledge this policy. For how the product works as a
        game (no real money, no equity), see our{" "}
        <a href="/terms">Terms of Service</a> and <a href="/disclaimer">Disclaimer</a>.
      </p>

      <h2>1. Who this policy covers</h2>
      <p>
        This policy applies to visitors and registered users of HypeXchange, including people
        who sign in with an email magic link, submit listing or sponsorship inquiries, or
        browse public pages.
      </p>

      <h2>2. Information we collect</h2>
      <h3>Account and profile information</h3>
      <p>Depending on how you use the Service, we may process:</p>
      <ul>
        <li>email address used to receive magic-link sign-in messages;</li>
        <li>username, display name, and optional avatar URL;</li>
        <li>account role and preferences such as whether you have seen the welcome state;</li>
        <li>
          fictional gameplay data: IXD cash balance, holdings, trades, watchlists, and
          related timestamps;
        </li>
        <li>
          content you submit, such as listing requests, sponsorship bid forms opened via
          email, and support messages.
        </li>
      </ul>

      <h3>Authentication and session data</h3>
      <p>
        We use email magic links (via Resend or a similar provider) and store sessions in
        our database so you can stay signed in. We may process verification tokens, session
        identifiers, and related security metadata.
      </p>

      <h3>Technical and usage information</h3>
      <p>
        Like most websites, we and our infrastructure providers may automatically receive
        limited technical data such as IP address, browser type, device/OS hints, referring
        URLs, pages viewed, and approximate timestamps. We may use this to operate, secure,
        and debug the Service.
      </p>

      <h3>Cookies and similar technologies</h3>
      <p>
        We use cookies or local storage as needed for authentication sessions, theme
        preference (for example light/dark mode), and basic site functionality. We do not
        operate the Service as a real-money payment product, so we do not use payment
        cookies for deposits or withdrawals.
      </p>

      <h2>3. How we use information</h2>
      <p>We use information to:</p>
      <ul>
        <li>create and authenticate accounts and keep sessions working;</li>
        <li>
          run the entertainment simulation (balances, trades, market pages, leaderboards,
          watchlists);
        </li>
        <li>moderate listing requests and respond to sponsorship or support emails;</li>
        <li>protect the Service against abuse, spam, and security incidents;</li>
        <li>understand reliability and improve performance and UX;</li>
        <li>comply with law or enforce our Terms when required.</li>
      </ul>
      <p>
        We do not sell your personal information. We do not process real-money trading
        deposits or withdrawals because the product does not offer them.
      </p>

      <h2>4. Public information on the Service</h2>
      <p>
        Some profile and gameplay elements may be visible to other users or visitors,
        including usernames, display names, avatars, public profile stats, leaderboard
        ranks, and activity that appears in market feeds. Do not put sensitive personal
        data in display names, bios, or listing text.
      </p>

      <h2>5. How we share information</h2>
      <p>We may share information with:</p>
      <ul>
        <li>
          <strong>Service providers</strong> who help us operate the Service (for example
          hosting, database, email delivery, analytics, or error monitoring), under
          obligations to use data only for providing their services to us;
        </li>
        <li>
          <strong>Professional advisors</strong> such as lawyers or accountants when needed;
        </li>
        <li>
          <strong>Authorities</strong> when we believe disclosure is required by law,
          regulation, legal process, or to protect rights, safety, or the integrity of the
          Service;
        </li>
        <li>
          <strong>A successor</strong> if we transfer or reorganize the project, in which
          case this policy will continue to apply to the transferred information unless you
          are notified otherwise.
        </li>
      </ul>
      <p>
        If you email us (including bid or listing inquiries), that correspondence is
        processed as a business communication so we can respond.
      </p>

      <h2>6. International processing</h2>
      <p>
        We may process and store information on servers or with vendors located in
        different countries. Where required, we take steps intended to protect information
        appropriately when it moves across borders.
      </p>

      <h2>7. Retention</h2>
      <p>
        We keep account and gameplay records while your account remains active and for a
        reasonable period afterward as needed to operate, secure, audit, or defend the
        Service, or as required by law. Backups may persist for a limited time after
        deletion.
      </p>
      <p>
        You may request account deletion or ask questions about retained data by emailing{" "}
        <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We may need to verify your request.
      </p>

      <h2>8. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect personal data,
        such as access controls and encrypted transport where appropriate. No method of
        transmission or storage is completely secure. Protect your email inbox and do not
        forward magic links.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is not directed to children under 13 (or the minimum age required in
        your region). We do not knowingly collect personal information from children. If
        you believe a child has provided information, contact us and we will take
        appropriate steps.
      </p>

      <h2>10. Your choices and rights</h2>
      <p>Depending on where you live, you may have rights to:</p>
      <ul>
        <li>access or receive a copy of personal information we hold about you;</li>
        <li>correct inaccurate information;</li>
        <li>request deletion of your account or certain data;</li>
        <li>object to or restrict certain processing; and</li>
        <li>lodge a complaint with a supervisory authority.</li>
      </ul>
      <p>
        To exercise a request, email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We will
        respond as required by applicable law. Some rights may not apply where we only
        process limited entertainment-account data, or where an exception applies.
      </p>

      <h2>11. Do Not Track and advertising</h2>
      <p>
        The Service may not respond to every browser “Do Not Track” signal in a uniform
        way. We do not sell personal information for cross-context behavioral advertising
        as that term is commonly defined. Promotional placements on HypeXchange are
        arranged through direct inquiries, not by selling your profile to ad networks.
      </p>

      <h2>12. Entertainment reminder</h2>
      <p>
        Portfolio values, prices, and IXD balances are fictional and have no real-world
        monetary value. Nothing in this Privacy Policy creates banking, brokerage, or
        investment obligations.
      </p>

      <h2>13. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The “Last updated” date will
        change when we do. Continued use of the Service after an update means you
        acknowledge the revised policy. For material changes, we may provide additional
        notice in the product or by email when practical.
      </p>

      <h2>14. Contact</h2>
      <p>
        Privacy questions or requests:{" "}
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
          "[&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-hx-text",
          "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
          "[&_a]:text-hx-link [&_a]:underline",
        ].join(" ")}
      >
        {children}
      </div>
    </article>
  );
}
