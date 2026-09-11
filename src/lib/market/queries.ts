import { Types } from "mongoose";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { resolveAvatarUrl } from "@/lib/avatar";
import { fromDecimal128, toNumberSafe } from "@/lib/formatting/mongo-decimal";
import {
  computePriceChangePct,
  fallbackChangePct,
  lookbackDate,
} from "@/lib/market/changes";
import {
  productLogoUrl,
  serializeHolding,
  serializeProduct,
  serializeProfile,
  serializeTrade,
} from "@/lib/market/serialize";
import { Holding, PriceHistory, Product, Profile, Trade, Watchlist } from "@/models";
import type { ProductDoc, ProfileDoc } from "@/models";
import {
  STARTING_CASH_IXD,
  type Category,
  type HoldingPublic,
  type ProductPublic,
  type ProfilePublic,
  type TradePublic,
} from "@/types";

export type MarketSort = "trending" | "gainers" | "losers" | "traded" | "newest" | "az";

export type PriceHistoryRange = "1H" | "24H" | "7D" | "1M" | "ALL";

export type LeaderboardPeriod = "overall" | "30d" | "7d";

type LeanProduct = ProductDoc & { createdAt?: Date; updatedAt?: Date };

function num(value: unknown): number {
  return toNumberSafe(fromDecimal128(value as never));
}

function approxChangePct(product: LeanProduct): number {
  return fallbackChangePct(num(product.currentPrice), num(product.startingPrice));
}

async function withChanges(
  products: LeanProduct[],
): Promise<ProductPublic[]> {
  const since24h = lookbackDate("24h");
  const since7d = lookbackDate("7d");

  return Promise.all(
    products.map(async (product) => {
      const current = num(product.currentPrice);
      const starting = num(product.startingPrice);
      const [change24h, change7d] = await Promise.all([
        computePriceChangePct(product._id, current, starting, since24h),
        computePriceChangePct(product._id, current, starting, since7d),
      ]);
      return serializeProduct(product, { change24h, change7d });
    }),
  );
}

export async function getProductBySlug(slug: string): Promise<ProductPublic | null> {
  await connectMongo();
  const product = await Product.findOne({ slug: slug.toLowerCase() }).lean<LeanProduct>();
  if (!product) return null;

  const current = num(product.currentPrice);
  const starting = num(product.startingPrice);
  const [change24h, change7d] = await Promise.all([
    computePriceChangePct(product._id, current, starting, lookbackDate("24h")),
    computePriceChangePct(product._id, current, starting, lookbackDate("7d")),
  ]);

  return serializeProduct(product, { change24h, change7d });
}

export async function getMarketProducts(options: {
  search?: string;
  category?: Category | string;
  sort?: MarketSort;
  page?: number;
  pageSize?: number;
} = {}): Promise<{
  products: (ProductPublic & { changePct?: number })[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  await connectMongo();

  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 24));
  const sort = options.sort ?? "trending";

  const filter: Record<string, unknown> = {
    status: { $in: ["active", "paused"] },
  };

  if (options.category && options.category !== "All") {
    filter.category = options.category;
  }

  if (options.search?.trim()) {
    const q = options.search.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { ticker: { $regex: q, $options: "i" } },
      { domain: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
    ];
  }

  const needsChangeSort = sort === "gainers" || sort === "losers";

  if (!needsChangeSort) {
    const sortSpec: Record<string, 1 | -1> =
      sort === "newest"
        ? { listedAt: -1 }
        : sort === "az"
          ? { name: 1 }
          : sort === "traded" || sort === "trending"
            ? { volume24h: -1 }
            : { volume24h: -1 };

    const [total, rows] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sortSpec)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<LeanProduct[]>(),
    ]);

    const products = await withChanges(rows);
    return {
      products,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  // Gainers / losers: approximate change from startingPrice for MVP sort,
  // then attach real change fields from history when available.
  const all = await Product.find(filter).lean<LeanProduct[]>();
  const enriched = all.map((product) => {
    const changePct = approxChangePct(product);
    return { product, changePct };
  });

  enriched.sort((a, b) =>
    sort === "gainers" ? b.changePct - a.changePct : a.changePct - b.changePct,
  );

  const total = enriched.length;
  const slice = enriched.slice((page - 1) * pageSize, page * pageSize);
  const serialized = await withChanges(slice.map((s) => s.product));

  const products = serialized.map((p, i) => ({
    ...p,
    changePct: slice[i]?.changePct ?? p.change24h,
  }));

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getTopMovers(
  limit = 10,
  period: "24h" | "7d" = "24h",
): Promise<ProductPublic[]> {
  await connectMongo();
  const since = lookbackDate(period);
  const products = await Product.find({ status: "active" }).lean<LeanProduct[]>();

  const scored = await Promise.all(
    products.map(async (product) => {
      const current = num(product.currentPrice);
      const starting = num(product.startingPrice);
      const change = await computePriceChangePct(product._id, current, starting, since);
      return { product, change };
    }),
  );

  scored.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  return scored.slice(0, limit).map(({ product, change }) =>
    serializeProduct(product, {
      change24h: period === "24h" ? change : 0,
      change7d: period === "7d" ? change : 0,
    }),
  );
}

type PopulatedTrade = {
  _id: Types.ObjectId;
  userId:
    | Types.ObjectId
    | {
        _id: Types.ObjectId;
        username: string;
        displayName: string;
        avatarUrl?: string;
      };
  productId:
    | Types.ObjectId
    | {
        _id: Types.ObjectId;
        name: string;
        ticker: string;
        slug: string;
        logoUrl?: string;
        domain?: string;
      };
  side: TradePublic["side"];
  cashAmount: unknown;
  shares: unknown;
  priceBefore: unknown;
  priceAfter: unknown;
  fee: unknown;
  realizedPnl: unknown;
  createdAt?: Date;
};

export async function getRecentTrades(limit = 20): Promise<TradePublic[]> {
  await connectMongo();
  const trades = await Trade.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("productId", "name ticker slug logoUrl domain")
    .populate("userId", "username displayName avatarUrl")
    .lean<PopulatedTrade[]>();

  return trades.map((trade) => {
    const product =
      trade.productId && typeof trade.productId === "object" && "slug" in trade.productId
        ? trade.productId
        : null;
    const user =
      trade.userId && typeof trade.userId === "object" && "username" in trade.userId
        ? trade.userId
        : null;

    return serializeTrade(
      {
        ...trade,
        productId: product?._id ?? (trade.productId as Types.ObjectId),
        userId: user?._id ?? (trade.userId as Types.ObjectId),
      } as never,
      {
        product: product
          ? {
              name: product.name,
              ticker: product.ticker,
              slug: product.slug,
              logoUrl: productLogoUrl(product.domain ?? "", product.logoUrl),
              domain: product.domain,
            }
          : undefined,
        user: user
          ? {
              username: user.username,
              displayName: user.displayName,
              avatarUrl: resolveAvatarUrl(user.avatarUrl, user.username),
            }
          : undefined,
      },
    );
  });
}

function rangeStart(range: PriceHistoryRange): Date | null {
  const now = Date.now();
  switch (range) {
    case "1H":
      return new Date(now - 60 * 60 * 1000);
    case "24H":
      return new Date(now - 24 * 60 * 60 * 1000);
    case "7D":
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "1M":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case "ALL":
      return null;
  }
}

export async function getProductPriceHistory(
  productId: string,
  range: PriceHistoryRange = "24H",
): Promise<{ time: string; price: number; volume: number }[]> {
  await connectMongo();
  const id = new Types.ObjectId(productId);
  const start = rangeStart(range);
  const filter: Record<string, unknown> = { productId: id };
  if (start) filter.createdAt = { $gte: start };

  const rows = await PriceHistory.find(filter)
    .sort({ createdAt: 1 })
    .select({ price: 1, volume: 1, createdAt: 1 })
    .lean();

  return rows.map((row) => ({
    time: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    price: num(row.price),
    volume: num(row.volume),
  }));
}

export async function getDashboardSnapshot(): Promise<{
  featured: ProductPublic[];
  topProducts: ProductPublic[];
  topGainers: ProductPublic[];
  topLosers: ProductPublic[];
  marketLeaders: ProductPublic[];
  recentActivity: TradePublic[];
}> {
  await connectMongo();

  const active = await Product.find({ status: "active" }).lean<LeanProduct[]>();
  const withPct = active.map((product) => ({
    product,
    changePct: approxChangePct(product),
    volume: num(product.volume24h),
    price: num(product.currentPrice),
    holders: product.holdersCount ?? 0,
  }));

  const byVolume = [...withPct].sort((a, b) => b.volume - a.volume);
  const byCap = [...withPct].sort((a, b) => b.price - a.price);
  const gainers = [...withPct].sort((a, b) => b.changePct - a.changePct);
  const losers = [...withPct].sort((a, b) => a.changePct - b.changePct);

  const serializeSlice = async (
    rows: typeof withPct,
    limit: number,
  ): Promise<ProductPublic[]> => {
    const slice = rows.slice(0, limit);
    return Promise.all(
      slice.map(async ({ product, changePct }) => {
        const current = num(product.currentPrice);
        const starting = num(product.startingPrice);
        const change7d = await computePriceChangePct(
          product._id,
          current,
          starting,
          lookbackDate("7d"),
        );
        return serializeProduct(product, {
          change24h: changePct,
          change7d,
        });
      }),
    );
  };

  const [featured, topProducts, topGainers, topLosers, marketLeaders, recentActivity] =
    await Promise.all([
      serializeSlice(byVolume, 4),
      serializeSlice(byVolume, 8),
      serializeSlice(gainers, 5),
      serializeSlice(losers, 5),
      serializeSlice(byCap, 5),
      getRecentTrades(12),
    ]);

  return {
    featured,
    topProducts,
    topGainers,
    topLosers,
    marketLeaders,
    recentActivity,
  };
}

export async function searchProducts(
  query: string,
  limit = 8,
): Promise<ProductPublic[]> {
  await connectMongo();
  const q = query.trim();
  if (!q) return [];

  const rows = await Product.find({
    status: { $in: ["active", "paused", "upcoming"] },
    $or: [
      { name: { $regex: q, $options: "i" } },
      { ticker: { $regex: q, $options: "i" } },
      { domain: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
    ],
  })
    .sort({ volume24h: -1 })
    .limit(limit)
    .lean<LeanProduct[]>();

  return withChanges(rows);
}

export async function getProfileByUsername(
  username: string,
): Promise<ProfilePublic | null> {
  await connectMongo();
  const profile = await Profile.findOne({
    username: username.toLowerCase(),
  }).lean<ProfileDoc & { createdAt?: Date }>();

  if (!profile) return null;

  const portfolio = await getPortfolio(profile._id.toString());
  const tradeCount = await Trade.countDocuments({ userId: profile._id });

  return serializeProfile(profile, {
    portfolioValue: portfolio.portfolioValue,
    returnPct: portfolio.returnPct,
    profit: portfolio.profit,
    tradeCount,
  });
}

export async function getPortfolio(profileId: string): Promise<{
  cash: number;
  holdings: HoldingPublic[];
  holdingsValue: number;
  portfolioValue: number;
  returnPct: number;
  profit: number;
}> {
  await connectMongo();
  const id = new Types.ObjectId(profileId);

  const [profile, holdings] = await Promise.all([
    Profile.findById(id).lean<ProfileDoc>(),
    Holding.find({ userId: id }).populate("productId").lean(),
  ]);

  const cash = profile ? num(profile.cashBalance) : 0;

  const serialized: HoldingPublic[] = [];
  let holdingsValue = 0;

  for (const holding of holdings) {
    const productDoc = holding.productId as unknown as LeanProduct | null;
    if (!productDoc || typeof productDoc !== "object" || !("currentPrice" in productDoc)) {
      continue;
    }

    const shares = num(holding.shares);
    const avgCost = num(holding.averageCost);
    const price = num(productDoc.currentPrice);
    const value = shares * price;
    const cost = shares * avgCost;
    const pnl = value - cost;
    const returnPct = cost === 0 ? 0 : (pnl / cost) * 100;

    holdingsValue += value;
    serialized.push(
      serializeHolding(
        {
          ...holding,
          productId: productDoc._id,
        } as never,
        {
          product: serializeProduct(productDoc),
          value,
          pnl,
          returnPct,
        },
      ),
    );
  }

  const portfolioValue = cash + holdingsValue;
  const profit = portfolioValue - STARTING_CASH_IXD;
  const returnPct = (profit / STARTING_CASH_IXD) * 100;

  return {
    cash,
    holdings: serialized,
    holdingsValue,
    portfolioValue,
    returnPct,
    profit,
  };
}

async function portfolioValueForProfile(
  profileId: Types.ObjectId,
  cashBalance: unknown,
  productPriceById: Map<string, number>,
): Promise<number> {
  const holdings = await Holding.find({ userId: profileId })
    .select({ productId: 1, shares: 1 })
    .lean();

  let total = num(cashBalance);
  for (const h of holdings) {
    const price = productPriceById.get(h.productId.toString()) ?? 0;
    total += num(h.shares) * price;
  }
  return total;
}

export async function getLeaderboard(
  period: LeaderboardPeriod = "overall",
  limit = 50,
): Promise<ProfilePublic[]> {
  await connectMongo();

  let profileFilter: Record<string, unknown> = {};
  if (period !== "overall") {
    const days = period === "7d" ? 7 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const activeUserIds = await Trade.distinct("userId", {
      createdAt: { $gte: since },
    });
    profileFilter = { _id: { $in: activeUserIds } };
  }

  const [profiles, products] = await Promise.all([
    Profile.find(profileFilter).lean<(ProfileDoc & { createdAt?: Date })[]>(),
    Product.find({ status: { $in: ["active", "paused"] } })
      .select({ currentPrice: 1 })
      .lean(),
  ]);

  const productPriceById = new Map(
    products.map((p) => [p._id.toString(), num(p.currentPrice)]),
  );

  const tradeCounts = await Trade.aggregate<{ _id: Types.ObjectId; count: number }>([
    ...(period !== "overall"
      ? [
          {
            $match: {
              createdAt: {
                $gte: new Date(
                  Date.now() - (period === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000,
                ),
              },
            },
          },
        ]
      : []),
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);
  const tradeCountByUser = new Map(
    tradeCounts.map((t) => [t._id.toString(), t.count]),
  );

  const ranked = await Promise.all(
    profiles.map(async (profile) => {
      const portfolioValue = await portfolioValueForProfile(
        profile._id,
        profile.cashBalance,
        productPriceById,
      );
      const profit = portfolioValue - STARTING_CASH_IXD;
      const returnPct = (profit / STARTING_CASH_IXD) * 100;
      return {
        profile,
        portfolioValue,
        profit,
        returnPct,
        tradeCount: tradeCountByUser.get(profile._id.toString()) ?? 0,
      };
    }),
  );

  ranked.sort((a, b) => b.returnPct - a.returnPct);

  return ranked.slice(0, limit).map((row, index) =>
    serializeProfile(row.profile, {
      portfolioValue: row.portfolioValue,
      returnPct: row.returnPct,
      profit: row.profit,
      tradeCount: row.tradeCount,
      rank: index + 1,
    }),
  );
}

export async function getWatchlist(profileId: string): Promise<ProductPublic[]> {
  await connectMongo();
  const id = new Types.ObjectId(profileId);

  const entries = await Watchlist.find({ userId: id })
    .sort({ createdAt: -1 })
    .populate("productId")
    .lean();

  const products = entries
    .map((e) => e.productId as unknown as LeanProduct | null)
    .filter((p): p is LeanProduct => Boolean(p && typeof p === "object" && "_id" in p));

  return withChanges(products);
}

export async function getIpoProducts(): Promise<{
  upcoming: ProductPublic[];
  newListings: ProductPublic[];
}> {
  await connectMongo();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [upcomingRows, newListingRows] = await Promise.all([
    Product.find({ status: "upcoming" }).sort({ listedAt: 1 }).lean<LeanProduct[]>(),
    Product.find({
      status: "active",
      listedAt: { $gte: fourteenDaysAgo },
    })
      .sort({ listedAt: -1 })
      .lean<LeanProduct[]>(),
  ]);

  const [upcoming, newListings] = await Promise.all([
    withChanges(upcomingRows),
    withChanges(newListingRows),
  ]);

  return { upcoming, newListings };
}
