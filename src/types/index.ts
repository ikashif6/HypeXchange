export const CATEGORIES = [
  "AI",
  "Developer Tools",
  "Design",
  "Productivity",
  "Marketing",
  "SaaS",
  "Commerce",
  "Automation",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ProductStatus = "active" | "paused" | "upcoming" | "delisted";
export type UserRole = "user" | "admin";
export type TradeSide = "buy" | "sell";
export type ListingRequestStatus = "pending" | "approved" | "rejected";

export const STARTING_CASH_IXD = 10_000;
export const DEFAULT_CASH_RESERVE = 100_000;
export const DEFAULT_SHARE_RESERVE = 10_000;
export const TRADING_FEE_RATE = 0.005;
export const HYPE_CAP_SHARES = 1_000_000;
export const FEE_RATE_LABEL = "0.5%";

export interface ProductPublic {
  id: string;
  name: string;
  ticker: string;
  slug: string;
  domain: string;
  description: string;
  category: Category;
  logoUrl: string;
  verified: boolean;
  status: ProductStatus;
  currentPrice: number;
  startingPrice: number;
  volume24h: number;
  holdersCount: number;
  change24h: number;
  change7d: number;
  hypeCap: number;
  createdAt: string;
  listedAt?: string | null;
}

export interface HoldingPublic {
  id: string;
  productId: string;
  shares: number;
  averageCost: number;
  product?: ProductPublic;
  value?: number;
  pnl?: number;
  returnPct?: number;
}

export interface TradePublic {
  id: string;
  userId: string;
  productId: string;
  side: TradeSide;
  cashAmount: number;
  shares: number;
  priceBefore: number;
  priceAfter: number;
  fee: number;
  realizedPnl: number;
  createdAt: string;
  product?: Pick<ProductPublic, "name" | "ticker" | "slug" | "logoUrl" | "domain">;
  user?: { username: string; displayName: string; avatarUrl?: string };
}

export interface ProfilePublic {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  cashBalance: number;
  role: UserRole;
  createdAt: string;
  portfolioValue?: number;
  returnPct?: number;
  profit?: number;
  tradeCount?: number;
  rank?: number | null;
}

export interface TradeEstimate {
  amount: number;
  fee: number;
  netSpend?: number;
  sharesReceived?: number;
  sharesSold?: number;
  grossPayout?: number;
  netPayout?: number;
  avgExecution: number;
  priceImpact: number;
  estimatedNewPrice: number;
  priceBefore: number;
}

export interface BuyTradeResult {
  ok: true;
  sharesReceived: number;
  fee: number;
  amountSpent: number;
  priceBefore: number;
  priceAfter: number;
  newCashBalance: number;
  ticker: string;
  productSlug: string;
}

export interface SellTradeResult {
  ok: true;
  sharesSold: number;
  fee: number;
  netPayout: number;
  priceBefore: number;
  priceAfter: number;
  newCashBalance: number;
  realizedPnl: number;
  ticker: string;
  productSlug: string;
}
