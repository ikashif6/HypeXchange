import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function tickerize(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
}

export function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function shareOnXUrl(text: string, url?: string) {
  // Put url in the text so the tweet is fully prefilled without extra editing.
  const full = url ? `${text.trim()} ${url}` : text.trim();
  return `https://twitter.com/intent/tweet?${new URLSearchParams({ text: full }).toString()}`;
}

export type ShareTarget =
  | "x"
  | "linkedin"
  | "facebook"
  | "reddit"
  | "telegram"
  | "whatsapp"
  | "email";

export interface ShareContent {
  url: string;
  /** Short headline for Reddit / email subject */
  title?: string;
  /** Main share copy (link will be appended where needed) */
  text: string;
  /** Longer email body without the URL (URL is appended) */
  emailBody?: string;
}

/** Build a ready-to-post profile share template. */
export function profileShareContent(opts: {
  url: string;
  displayName: string;
  username: string;
  portfolioValue?: string;
  returnPct?: string;
  tradeCount?: number;
}): ShareContent {
  const handle = `@${opts.username}`;
  const stats: string[] = [];
  if (opts.portfolioValue) stats.push(`Portfolio ${opts.portfolioValue}`);
  if (opts.returnPct) stats.push(`Return ${opts.returnPct}`);
  if (opts.tradeCount != null) stats.push(`${opts.tradeCount} trades`);
  const statsLine = stats.length > 0 ? ` ${stats.join(" · ")}.` : "";

  const text = `Check out ${opts.displayName} (${handle}) on HypeXchange.${statsLine} They are trading fictional shares of internet products with IXD.`;
  const emailBody = [
    `I found this trader on HypeXchange:`,
    "",
    `${opts.displayName} (${handle})`,
    stats.length > 0 ? stats.join(" · ") : null,
    "",
    "HypeXchange is an entertainment market for fictional internet-product shares using IXD. No real money.",
    "",
    "View the profile:",
  ]
    .filter((line) => line !== null)
    .join("\n");

  return {
    url: opts.url,
    title: `${opts.displayName} on HypeXchange`,
    text,
    emailBody,
  };
}

/** Build a ready-to-post leaderboard share template. */
export function leaderboardShareContent(opts: {
  url: string;
  periodLabel?: string;
}): ShareContent {
  const period =
    opts.periodLabel && opts.periodLabel !== "Overall"
      ? ` (${opts.periodLabel})`
      : "";
  const text = `I am following the HypeXchange leaderboard${period}, where traders compete with fictional IXD on internet-product shares. Come see who is ahead.`;
  const emailBody = [
    "Check out the HypeXchange leaderboard.",
    "",
    "Traders are ranked by fictional portfolio return from a starting balance of 10,000 IXD. It is an entertainment market with no real money.",
    "",
    "Open the leaderboard:",
  ].join("\n");

  return {
    url: opts.url,
    title: "HypeXchange leaderboard",
    text,
    emailBody,
  };
}

export function buildShareUrl(target: ShareTarget, content: ShareContent) {
  const { url, text, title = "HypeXchange", emailBody } = content;
  const messageWithLink = `${text.trim()}\n\n${url}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedMessage = encodeURIComponent(messageWithLink);
  const encodedText = encodeURIComponent(text.trim());

  switch (target) {
    case "x":
      // Single prefilled tweet body (text + link).
      return shareOnXUrl(text, url);
    case "linkedin":
      // Opens LinkedIn compose with prefilled text + link.
      return `https://www.linkedin.com/feed/?shareActive=true&text=${encodedMessage}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodedMessage}`;
    case "email": {
      const body = `${emailBody?.trim() || text.trim()}\n\n${url}`;
      return `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(body)}`;
    }
  }
}
