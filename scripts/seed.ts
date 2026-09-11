import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
import mongoose from "mongoose";
import { SEED_PRODUCTS } from "../data/products";
import {
  DEFAULT_CASH_RESERVE,
  DEFAULT_SHARE_RESERVE,
  STARTING_CASH_IXD,
} from "../src/types";
import { toDecimal128 } from "../src/lib/formatting/mongo-decimal";
import { applyBuy, applySell } from "../src/lib/market/amm";
import { slugify } from "../src/lib/utils";

const FIRST_NAMES = [
  "Alex", "Maya", "Jordan", "Sam", "Riley", "Casey", "Avery", "Quinn", "Morgan", "Taylor",
  "Jamie", "Drew", "Cameron", "Blake", "Harper", "Rowan", "Skyler", "Parker", "Reese", "Finley",
  "Kai", "Nora", "Leo", "Ivy", "Ezra", "Mila", "Owen", "Zoe", "Nina", "Luca",
  "Aria", "Noah", "Luna", "Elena", "Hugo", "Clara", "Felix", "Iris", "Marcus", "Sofia",
  "Amir", "Priya", "Chen", "Yuki", "Omar", "Leila", "Diego", "Anya", "Ravi", "Sana",
];

const LAST_NAMES = [
  "Rivera", "Chen", "Lee", "Ortiz", "Patel", "Nguyen", "Kim", "Garcia", "Singh", "Brooks",
  "Walsh", "Torres", "Hayes", "Reed", "Bennett", "Coleman", "Foster", "Griffin", "Powell", "Butler",
  "Ahmed", "Khan", "Ali", "Park", "Sato", "Costa", "Silva", "Novak", "Berg", "Anders",
  "Hughes", "Murray", "Price", "Woods", "Lane", "Fox", "Stone", "West", "Cross", "Blair",
];

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDemoUsers(count: number) {
  const users: { username: string; displayName: string; email: string }[] = [];
  const used = new Set<string>();
  let i = 0;
  while (users.length < count) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
    const n = Math.floor(i / (FIRST_NAMES.length * LAST_NAMES.length)) + 1;
    let username = `${first}${last}`.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    if (n > 1) username = `${username}${n}`.slice(0, 24);
    if (used.has(username)) {
      username = `${username}${users.length}`.slice(0, 24);
    }
    used.add(username);
    users.push({
      username,
      displayName: `${first} ${last}${n > 1 ? ` ${n}` : ""}`,
      email: `${username}@demo.hypexchange.local`,
    });
    i += 1;
  }
  return users;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI. Copy .env.example to .env.local and set it.");
    process.exit(1);
  }

  const withDemo = process.argv.includes("--demo");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  if (!db) throw new Error("No database");

  const products = db.collection("products");
  const profiles = db.collection("profiles");
  const trades = db.collection("trades");
  const priceHistory = db.collection("pricehistories");
  const holdings = db.collection("holdings");

  let upserted = 0;
  for (const item of SEED_PRODUCTS) {
    const slug = slugify(item.name);
    const startingPrice = DEFAULT_CASH_RESERVE / DEFAULT_SHARE_RESERVE;
    const doc = {
      name: item.name,
      ticker: item.ticker.toUpperCase(),
      slug,
      domain: item.domain.toLowerCase(),
      description: item.description,
      category: item.category,
      logoUrl: "",
      verified: true,
      status: "active" as const,
      cashReserve: toDecimal128(DEFAULT_CASH_RESERVE),
      shareReserve: toDecimal128(DEFAULT_SHARE_RESERVE),
      initialCashReserve: toDecimal128(DEFAULT_CASH_RESERVE),
      initialShareReserve: toDecimal128(DEFAULT_SHARE_RESERVE),
      startingPrice: toDecimal128(startingPrice),
      currentPrice: toDecimal128(startingPrice),
      volume24h: toDecimal128(0),
      holdersCount: 0,
      allTimeHigh: toDecimal128(startingPrice),
      listedAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await products.updateOne(
      { ticker: doc.ticker },
      {
        $set: {
          name: doc.name,
          slug: doc.slug,
          domain: doc.domain,
          description: doc.description,
          category: doc.category,
          verified: true,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          logoUrl: "",
          status: "active",
          cashReserve: doc.cashReserve,
          shareReserve: doc.shareReserve,
          initialCashReserve: doc.initialCashReserve,
          initialShareReserve: doc.initialShareReserve,
          startingPrice: doc.startingPrice,
          currentPrice: doc.currentPrice,
          volume24h: doc.volume24h,
          holdersCount: 0,
          allTimeHigh: doc.allTimeHigh,
          listedAt: new Date(),
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount) upserted += 1;
  }

  const upcoming = ["Raycast", "n8n", "Cal.com"];
  for (const name of upcoming) {
    await products.updateOne(
      { name },
      {
        $set: {
          status: "upcoming",
          currentPrice: toDecimal128(10),
          listedAt: null,
        },
      },
    );
  }

  console.log(`Seeded products. New inserts: ${upserted}. Total catalog: ${SEED_PRODUCTS.length}`);

  if (withDemo) {
    console.log("Seeding DEMO market: 100+ traders with AMM-backed activity...");

    const oldDemoProfiles = await profiles.find({ isDemo: true }).project({ _id: 1 }).toArray();
    const oldIds = oldDemoProfiles.map((p) => p._id);
    if (oldIds.length) {
      await holdings.deleteMany({ userId: { $in: oldIds } });
      await trades.deleteMany({ userId: { $in: oldIds } });
    }
    await trades.deleteMany({ isDemo: true });
    await priceHistory.deleteMany({ isDemo: true });
    await profiles.deleteMany({ isDemo: true });

    // Reset active product pools so demo trading starts from a clean book
    await products.updateMany(
      { status: "active" },
      {
        $set: {
          cashReserve: toDecimal128(DEFAULT_CASH_RESERVE),
          shareReserve: toDecimal128(DEFAULT_SHARE_RESERVE),
          currentPrice: toDecimal128(DEFAULT_CASH_RESERVE / DEFAULT_SHARE_RESERVE),
          allTimeHigh: toDecimal128(DEFAULT_CASH_RESERVE / DEFAULT_SHARE_RESERVE),
          volume24h: toDecimal128(0),
          holdersCount: 0,
          updatedAt: new Date(),
        },
      },
    );

    const DEMO_USER_COUNT = 112;
    const demoUsers = buildDemoUsers(DEMO_USER_COUNT);
    const rand = mulberry32(20260911);

    type DemoProfile = {
      _id: mongoose.Types.ObjectId;
      username: string;
      cash: number;
      positions: Map<string, { shares: number; avgCost: number }>;
    };

    const demoProfiles: DemoProfile[] = [];
    for (const u of demoUsers) {
      const _id = new mongoose.Types.ObjectId();
      await profiles.insertOne({
        _id,
        userId: _id.toString(),
        email: u.email,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: "",
        cashBalance: toDecimal128(STARTING_CASH_IXD),
        role: "user",
        welcomeSeen: true,
        isDemo: true,
        createdAt: new Date(Date.now() - rand() * 40 * 86400000),
        updatedAt: new Date(),
      });
      demoProfiles.push({
        _id,
        username: u.username,
        cash: STARTING_CASH_IXD,
        positions: new Map(),
      });
    }

    const activeProducts = await products.find({ status: "active" }).toArray();
    type Pool = {
      _id: mongoose.Types.ObjectId;
      ticker: string;
      cash: number;
      shares: number;
      ath: number;
      volume24h: number;
      history: { t: number; price: number; volume: number }[];
    };

    const pools: Pool[] = activeProducts.map((p) => ({
      _id: p._id as mongoose.Types.ObjectId,
      ticker: String(p.ticker),
      cash: DEFAULT_CASH_RESERVE,
      shares: DEFAULT_SHARE_RESERVE,
      ath: DEFAULT_CASH_RESERVE / DEFAULT_SHARE_RESERVE,
      volume24h: 0,
      history: [],
    }));

    const now = Date.now();
    const dayMs = 86400000;
    const tradeDocs: Record<string, unknown>[] = [];
    const TRADE_EVENTS = 1800;

    for (let i = 0; i < TRADE_EVENTS; i++) {
      const profile = demoProfiles[Math.floor(rand() * demoProfiles.length)];
      const pool = pools[Math.floor(rand() * pools.length)];
      const createdAt = new Date(now - rand() * 14 * dayMs);
      const ageHours = (now - createdAt.getTime()) / 3_600_000;
      const priceBefore = pool.cash / pool.shares;
      const position = profile.positions.get(pool._id.toString());

      const wantSell =
        position &&
        position.shares > 0.5 &&
        (rand() < 0.28 || profile.cash < 400);

      try {
        if (wantSell && position) {
          const frac = 0.15 + rand() * 0.55;
          const sharesToSell = Math.min(position.shares * frac, position.shares);
          if (sharesToSell <= 0.01) continue;
          const result = applySell(
            { cashReserve: pool.cash, shareReserve: pool.shares },
            sharesToSell,
          );
          const net = Number(result.netPayout.toString());
          const fee = Number(result.fee.toString());
          const sold = Number(result.sharesSold.toString());
          const priceAfter = Number(result.priceAfter.toString());
          const costBasis = position.avgCost * sold;
          const realized = net - costBasis;

          pool.cash = Number(result.newCashReserve.toString());
          pool.shares = Number(result.newShareReserve.toString());
          pool.ath = Math.max(pool.ath, priceAfter);
          if (ageHours <= 24) pool.volume24h += net + fee;
          profile.cash += net;

          const remaining = position.shares - sold;
          if (remaining <= 0.0001) profile.positions.delete(pool._id.toString());
          else profile.positions.set(pool._id.toString(), { shares: remaining, avgCost: position.avgCost });

          tradeDocs.push({
            userId: profile._id,
            productId: pool._id,
            side: "sell",
            cashAmount: toDecimal128(net),
            shares: toDecimal128(sold),
            priceBefore: toDecimal128(priceBefore),
            priceAfter: toDecimal128(priceAfter),
            fee: toDecimal128(fee),
            realizedPnl: toDecimal128(realized),
            isDemo: true,
            createdAt,
          });
          pool.history.push({ t: createdAt.getTime(), price: priceAfter, volume: net });
        } else {
          const spend = Math.min(
            profile.cash * (0.04 + rand() * 0.18),
            80 + rand() * 900,
          );
          if (spend < 25 || profile.cash < spend) continue;
          const result = applyBuy(
            { cashReserve: pool.cash, shareReserve: pool.shares },
            spend,
          );
          const sharesReceived = Number(result.sharesReceived.toString());
          const fee = Number(result.fee.toString());
          const netSpend = Number(result.netSpend.toString());
          const priceAfter = Number(result.priceAfter.toString());
          const avg = netSpend / sharesReceived;

          pool.cash = Number(result.newCashReserve.toString());
          pool.shares = Number(result.newShareReserve.toString());
          pool.ath = Math.max(pool.ath, priceAfter);
          if (ageHours <= 24) pool.volume24h += spend;
          profile.cash -= spend;

          const existing = profile.positions.get(pool._id.toString());
          if (existing) {
            const totalShares = existing.shares + sharesReceived;
            const avgCost =
              (existing.avgCost * existing.shares + avg * sharesReceived) / totalShares;
            profile.positions.set(pool._id.toString(), { shares: totalShares, avgCost });
          } else {
            profile.positions.set(pool._id.toString(), {
              shares: sharesReceived,
              avgCost: avg,
            });
          }

          tradeDocs.push({
            userId: profile._id,
            productId: pool._id,
            side: "buy",
            cashAmount: toDecimal128(spend),
            shares: toDecimal128(sharesReceived),
            priceBefore: toDecimal128(priceBefore),
            priceAfter: toDecimal128(priceAfter),
            fee: toDecimal128(fee),
            realizedPnl: toDecimal128(0),
            isDemo: true,
            createdAt,
          });
          pool.history.push({ t: createdAt.getTime(), price: priceAfter, volume: spend });
        }
      } catch {
        // skip invalid edge trades
      }
    }

    // Sort trades chronologically for insert readability
    tradeDocs.sort(
      (a, b) =>
        (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime(),
    );

    if (tradeDocs.length) {
      await trades.insertMany(tradeDocs, { ordered: false });
    }

    const holdingDocs: Record<string, unknown>[] = [];
    for (const profile of demoProfiles) {
      for (const [productId, pos] of profile.positions) {
        if (pos.shares <= 0.0001) continue;
        holdingDocs.push({
          userId: profile._id,
          productId: new mongoose.Types.ObjectId(productId),
          shares: toDecimal128(pos.shares),
          averageCost: toDecimal128(pos.avgCost),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      await profiles.updateOne(
        { _id: profile._id },
        { $set: { cashBalance: toDecimal128(Math.max(profile.cash, 0)), updatedAt: new Date() } },
      );
    }
    if (holdingDocs.length) {
      await holdings.insertMany(holdingDocs, { ordered: false });
    }

    const historyDocs: Record<string, unknown>[] = [];
    for (const pool of pools) {
      const points = new Map<number, { price: number; volume: number }>();
      // Baseline path so every product has a chart even with few trades
      let px = DEFAULT_CASH_RESERVE / DEFAULT_SHARE_RESERVE;
      for (let h = 72; h >= 0; h--) {
        const t = now - h * 3_600_000;
        px = Math.max(1.5, px * (1 + (rand() - 0.48) * 0.012));
        points.set(Math.floor(t / 3_600_000), { price: px, volume: rand() * 200 });
      }
      for (const event of pool.history) {
        const key = Math.floor(event.t / 3_600_000);
        const prev = points.get(key);
        points.set(key, {
          price: event.price,
          volume: (prev?.volume ?? 0) + event.volume,
        });
      }

      for (const [bucket, point] of points) {
        historyDocs.push({
          productId: pool._id,
          price: toDecimal128(point.price),
          volume: toDecimal128(point.volume),
          isDemo: true,
          createdAt: new Date(bucket * 3_600_000),
        });
      }

      const holders = demoProfiles.filter((p) =>
        p.positions.has(pool._id.toString()),
      ).length;

      const currentPrice = pool.cash / pool.shares;

      await products.updateOne(
        { _id: pool._id },
        {
          $set: {
            cashReserve: toDecimal128(pool.cash),
            shareReserve: toDecimal128(pool.shares),
            currentPrice: toDecimal128(currentPrice),
            allTimeHigh: toDecimal128(Math.max(pool.ath, currentPrice)),
            volume24h: toDecimal128(pool.volume24h),
            holdersCount: holders,
            updatedAt: new Date(),
          },
        },
      );
    }

    if (historyDocs.length) {
      await priceHistory.insertMany(historyDocs, { ordered: false });
    }

    console.log(
      `Demo ready: ${demoProfiles.length} users, ${tradeDocs.length} trades, ${holdingDocs.length} holdings, ${historyDocs.length} price points across ${pools.length} markets.`,
    );
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
