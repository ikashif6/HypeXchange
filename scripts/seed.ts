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
import { slugify } from "../src/lib/utils";

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

  // Mark a few as upcoming IPOs for the IPO page
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
    console.log("Seeding DEMO users/trades (development only)...");
    // Clear previous demo markers
    await trades.deleteMany({ isDemo: true });
    await priceHistory.deleteMany({ isDemo: true });
    await profiles.deleteMany({ isDemo: true });

    const demoUsers = [
      { username: "alex", displayName: "Alex Rivera", email: "alex@demo.hypexchange.local" },
      { username: "kashif", displayName: "Kashif", email: "kashif@demo.hypexchange.local" },
      { username: "maya", displayName: "Maya Chen", email: "maya@demo.hypexchange.local" },
      { username: "jordan", displayName: "Jordan Lee", email: "jordan@demo.hypexchange.local" },
      { username: "sam", displayName: "Sam Ortiz", email: "sam@demo.hypexchange.local" },
    ];

    const demoProfileIds: { _id: mongoose.Types.ObjectId; username: string }[] = [];
    for (const u of demoUsers) {
      const _id = new mongoose.Types.ObjectId();
      await profiles.updateOne(
        { username: u.username },
        {
          $set: {
            email: u.email,
            displayName: u.displayName,
            avatarUrl: "",
            cashBalance: toDecimal128(STARTING_CASH_IXD),
            role: "user",
            welcomeSeen: true,
            isDemo: true,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            _id,
            userId: _id,
            username: u.username,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
      const p = await profiles.findOne({ username: u.username });
      if (p) demoProfileIds.push({ _id: p._id as mongoose.Types.ObjectId, username: u.username });
    }

    const activeProducts = await products.find({ status: "active" }).limit(40).toArray();
    const now = Date.now();

    for (const product of activeProducts) {
      // Lightweight demo price path (clearly marked isDemo)
      let price = 10;
      for (let i = 48; i >= 0; i--) {
        const drift = (Math.sin(i / 3 + product.ticker.length) * 0.4 + (Math.random() - 0.5) * 0.35);
        price = Math.max(2, price * (1 + drift / 100));
        await priceHistory.insertOne({
          productId: product._id,
          price: toDecimal128(price),
          volume: toDecimal128(Math.random() * 800),
          isDemo: true,
          createdAt: new Date(now - i * 60 * 60 * 1000),
        });
      }
      await products.updateOne(
        { _id: product._id },
        {
          $set: {
            currentPrice: toDecimal128(price),
            allTimeHigh: toDecimal128(Math.max(price, 10)),
            volume24h: toDecimal128(Math.random() * 25000 + 1000),
          },
        },
      );
    }

    // A few demo holdings/trades
    for (const profile of demoProfileIds) {
      const picks = activeProducts.slice(0, 5);
      let cash = STARTING_CASH_IXD;
      for (const product of picks) {
        const spend = 200 + Math.random() * 800;
        const px = Number(product.currentPrice?.toString?.() ?? 10);
        const shares = spend / px;
        cash -= spend;
        await holdings.updateOne(
          { userId: profile._id, productId: product._id },
          {
            $set: {
              shares: toDecimal128(shares),
              averageCost: toDecimal128(px * 0.92),
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true },
        );
        await trades.insertOne({
          userId: profile._id,
          productId: product._id,
          side: "buy",
          cashAmount: toDecimal128(spend),
          shares: toDecimal128(shares),
          priceBefore: toDecimal128(px * 0.99),
          priceAfter: toDecimal128(px),
          fee: toDecimal128(spend * 0.005),
          realizedPnl: toDecimal128(0),
          isDemo: true,
          createdAt: new Date(now - Math.random() * 7 * 86400000),
        });
      }
      await profiles.updateOne(
        { _id: profile._id },
        { $set: { cashBalance: toDecimal128(Math.max(cash, 500)) } },
      );
    }

    console.log("Demo data inserted (isDemo: true). Do not treat as real activity in production.");
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
