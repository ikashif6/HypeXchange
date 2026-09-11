import { fromDecimal128, toNumberSafe } from "@/lib/formatting/mongo-decimal";
import { resolveAvatarUrl } from "@/lib/avatar";
import { hypeCap } from "@/lib/market/amm";
import type { HoldingDoc, ProductDoc, ProfileDoc, TradeDoc } from "@/models";
import type {
  HoldingPublic,
  ProductPublic,
  ProfilePublic,
  TradePublic,
  TradeSide,
  UserRole,
} from "@/types";
import { HYPE_CAP_SHARES } from "@/types";

type IdLike = { toString(): string } | string;

function idOf(value: IdLike): string {
  return typeof value === "string" ? value : value.toString();
}

function dateOf(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function num(value: unknown): number {
  return toNumberSafe(fromDecimal128(value as never));
}

/** Prefer stored logo; otherwise a larger Google favicon for the domain. */
export function productLogoUrl(domain: string, logoUrl?: string): string {
  const trimmed = logoUrl?.trim();
  if (trimmed) return trimmed;
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return `https://www.google.com/s2/favicons?sz=128&domain_url=https://${encodeURIComponent(host)}`;
}

export function serializeProduct(
  product: ProductDoc | (ProductDoc & Record<string, unknown>),
  extras?: { change24h?: number; change7d?: number },
): ProductPublic {
  const currentPrice = num(product.currentPrice);
  return {
    id: idOf(product._id),
    name: product.name,
    ticker: product.ticker,
    slug: product.slug,
    domain: product.domain,
    description: product.description ?? "",
    category: product.category,
    logoUrl: productLogoUrl(product.domain, product.logoUrl),
    verified: Boolean(product.verified),
    status: product.status,
    currentPrice,
    startingPrice: num(product.startingPrice),
    volume24h: num(product.volume24h),
    holdersCount: product.holdersCount ?? 0,
    change24h: extras?.change24h ?? 0,
    change7d: extras?.change7d ?? 0,
    hypeCap: hypeCap(currentPrice, HYPE_CAP_SHARES),
    createdAt: dateOf(product.createdAt) ?? new Date(0).toISOString(),
    listedAt: dateOf(product.listedAt),
  };
}

export function serializeProfile(
  profile: ProfileDoc | (ProfileDoc & Record<string, unknown>),
  extras?: Partial<
    Pick<ProfilePublic, "portfolioValue" | "returnPct" | "profit" | "tradeCount" | "rank">
  >,
): ProfilePublic {
  return {
    id: idOf(profile._id),
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: resolveAvatarUrl(profile.avatarUrl, profile.username),
    cashBalance: num(profile.cashBalance),
    role: profile.role as UserRole,
    createdAt: dateOf(profile.createdAt) ?? new Date(0).toISOString(),
    portfolioValue: extras?.portfolioValue,
    returnPct: extras?.returnPct,
    profit: extras?.profit,
    tradeCount: extras?.tradeCount,
    rank: extras?.rank,
  };
}

export function serializeHolding(
  holding: HoldingDoc | (HoldingDoc & Record<string, unknown>),
  extras?: {
    product?: ProductPublic;
    value?: number;
    pnl?: number;
    returnPct?: number;
  },
): HoldingPublic {
  return {
    id: idOf(holding._id),
    productId: idOf(holding.productId as IdLike),
    shares: num(holding.shares),
    averageCost: num(holding.averageCost),
    product: extras?.product,
    value: extras?.value,
    pnl: extras?.pnl,
    returnPct: extras?.returnPct,
  };
}

type PopulatedTradeProduct = Pick<ProductPublic, "name" | "ticker" | "slug" | "logoUrl"> & {
  domain?: string;
  logoUrl?: string;
};

export function serializeTrade(
  trade: TradeDoc | (TradeDoc & Record<string, unknown>),
  extras?: {
    product?: PopulatedTradeProduct | ProductPublic;
    user?: { username: string; displayName: string; avatarUrl?: string };
  },
): TradePublic {
  let product: TradePublic["product"];
  if (extras?.product) {
    const p = extras.product;
    product = {
      name: p.name,
      ticker: p.ticker,
      slug: p.slug,
      domain: ("domain" in p && p.domain) || "",
      logoUrl:
        "domain" in p && p.domain
          ? productLogoUrl(p.domain, p.logoUrl)
          : (p.logoUrl ?? ""),
    };
  }

  return {
    id: idOf(trade._id),
    userId: idOf(trade.userId as IdLike),
    productId: idOf(trade.productId as IdLike),
    side: trade.side as TradeSide,
    cashAmount: num(trade.cashAmount),
    shares: num(trade.shares),
    priceBefore: num(trade.priceBefore),
    priceAfter: num(trade.priceAfter),
    fee: num(trade.fee),
    realizedPnl: num(trade.realizedPnl),
    createdAt: dateOf(trade.createdAt) ?? new Date(0).toISOString(),
    product,
    user: extras?.user,
  };
}
