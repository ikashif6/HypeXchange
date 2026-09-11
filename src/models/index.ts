import mongoose, { Schema, models, model, type InferSchemaType, type Model } from "mongoose";
import {
  CATEGORIES,
  DEFAULT_CASH_RESERVE,
  DEFAULT_SHARE_RESERVE,
  STARTING_CASH_IXD,
  type Category,
  type ListingRequestStatus,
  type ProductStatus,
  type TradeSide,
  type UserRole,
} from "@/types";
import { toDecimal128 } from "@/lib/formatting/mongo-decimal";

const decimal = { type: Schema.Types.Decimal128, required: true };

const ProfileSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
      index: true,
    },
    displayName: { type: String, required: true, trim: true, maxlength: 64 },
    avatarUrl: { type: String, default: "" },
    cashBalance: { ...decimal, default: () => toDecimal128(STARTING_CASH_IXD) },
    role: { type: String, enum: ["user", "admin"] satisfies UserRole[], default: "user" },
    welcomeSeen: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: "text" },
    ticker: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    domain: { type: String, required: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: CATEGORIES as unknown as Category[],
      required: true,
      index: true,
    },
    logoUrl: { type: String, default: "" },
    verified: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "paused", "upcoming", "delisted"] satisfies ProductStatus[],
      default: "active",
      index: true,
    },
    cashReserve: { ...decimal, default: () => toDecimal128(DEFAULT_CASH_RESERVE) },
    shareReserve: { ...decimal, default: () => toDecimal128(DEFAULT_SHARE_RESERVE) },
    initialCashReserve: { ...decimal, default: () => toDecimal128(DEFAULT_CASH_RESERVE) },
    initialShareReserve: { ...decimal, default: () => toDecimal128(DEFAULT_SHARE_RESERVE) },
    startingPrice: { ...decimal, default: () => toDecimal128(10) },
    currentPrice: { ...decimal, default: () => toDecimal128(10), index: true },
    volume24h: { ...decimal, default: () => toDecimal128(0) },
    holdersCount: { type: Number, default: 0 },
    allTimeHigh: { ...decimal, default: () => toDecimal128(10) },
    listedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

ProductSchema.index({ status: 1, category: 1, currentPrice: -1 });
ProductSchema.index({ status: 1, volume24h: -1 });
ProductSchema.index({ name: "text", ticker: "text", domain: "text" });

const HoldingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    shares: { ...decimal, default: () => toDecimal128(0) },
    averageCost: { ...decimal, default: () => toDecimal128(0) },
  },
  { timestamps: true },
);

HoldingSchema.index({ userId: 1, productId: 1 }, { unique: true });

const TradeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    side: { type: String, enum: ["buy", "sell"] satisfies TradeSide[], required: true },
    cashAmount: decimal,
    shares: decimal,
    priceBefore: decimal,
    priceAfter: decimal,
    fee: decimal,
    realizedPnl: { ...decimal, default: () => toDecimal128(0) },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

TradeSchema.index({ productId: 1, createdAt: -1 });
TradeSchema.index({ userId: 1, createdAt: -1 });
TradeSchema.index({ createdAt: -1 });

const PriceHistorySchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    price: decimal,
    volume: { ...decimal, default: () => toDecimal128(0) },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

PriceHistorySchema.index({ productId: 1, createdAt: -1 });

const WatchlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

WatchlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const ListingRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    productName: { type: String, required: true, trim: true },
    domain: { type: String, required: true, lowercase: true, trim: true },
    suggestedTicker: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: CATEGORIES as unknown as Category[],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"] satisfies ListingRequestStatus[],
      default: "pending",
      index: true,
    },
    adminNote: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export type ProfileDoc = InferSchemaType<typeof ProfileSchema> & { _id: mongoose.Types.ObjectId };
export type ProductDoc = InferSchemaType<typeof ProductSchema> & { _id: mongoose.Types.ObjectId };
export type HoldingDoc = InferSchemaType<typeof HoldingSchema> & { _id: mongoose.Types.ObjectId };
export type TradeDoc = InferSchemaType<typeof TradeSchema> & { _id: mongoose.Types.ObjectId };
export type PriceHistoryDoc = InferSchemaType<typeof PriceHistorySchema> & {
  _id: mongoose.Types.ObjectId;
};
export type WatchlistDoc = InferSchemaType<typeof WatchlistSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type ListingRequestDoc = InferSchemaType<typeof ListingRequestSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Profile: Model<ProfileDoc> =
  models.Profile || model<ProfileDoc>("Profile", ProfileSchema);
export const Product: Model<ProductDoc> =
  models.Product || model<ProductDoc>("Product", ProductSchema);
export const Holding: Model<HoldingDoc> =
  models.Holding || model<HoldingDoc>("Holding", HoldingSchema);
export const Trade: Model<TradeDoc> = models.Trade || model<TradeDoc>("Trade", TradeSchema);
export const PriceHistory: Model<PriceHistoryDoc> =
  models.PriceHistory || model<PriceHistoryDoc>("PriceHistory", PriceHistorySchema);
export const Watchlist: Model<WatchlistDoc> =
  models.Watchlist || model<WatchlistDoc>("Watchlist", WatchlistSchema);
export const ListingRequest: Model<ListingRequestDoc> =
  models.ListingRequest || model<ListingRequestDoc>("ListingRequest", ListingRequestSchema);
