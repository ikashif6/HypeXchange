"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const EXPLORE = [
  { href: "/", label: "Dashboard" },
  { href: "/market", label: "Market" },
  { href: "/ipos", label: "IPOs" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/founders", label: "For founders" },
] as const;

const ACCOUNT = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/auth/signin", label: "Sign in" },
  { href: "/request-listing", label: "Request a listing" },
] as const;

const LEGAL = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "mailto:contact@hypexchange.space", label: "Contact" },
] as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  const className =
    "text-[13px] text-hx-secondary transition-colors hover:text-hx-link";

  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-text">
        {title}
      </h3>
      <ul className="mt-3.5 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <FooterLink href={link.href} label={link.label} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-hx-border bg-hx-card">
      <div className="hx-container py-10 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr] lg:gap-10">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <BrandLogo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-hx-secondary">
              Buy and sell fictional shares of internet products, with no real money
              involved.
            </p>
            <p className="mt-4 font-mono-num text-xs text-hx-muted">
              IXD stands for Internet Dollars
            </p>
          </div>

          <FooterColumn title="Explore" links={EXPLORE} />
          <FooterColumn title="Account" links={ACCOUNT} />
          <FooterColumn title="Legal" links={LEGAL} />

          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-text">
              Preferences
            </h3>
            <p className="mt-3.5 text-[13px] text-hx-secondary">Theme</p>
            <div className="mt-2">
              <ThemeToggle variant="segmented" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-hx-border">
        <div className="hx-container space-y-4 py-5 max-md:pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:py-5">
          <p className="max-w-4xl text-[12px] leading-relaxed text-hx-muted">
            HypeXchange is an entertainment game using fictional currency. IXD has no
            monetary value. Virtual shares do not represent ownership, equity,
            securities, investment products, or actual company valuations. Nothing on
            this site is financial advice.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-hx-muted">
              © {year} HypeXchange. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
