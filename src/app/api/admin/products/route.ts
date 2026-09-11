import { NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { AdminAuthError, requireAdmin } from "@/lib/api/require-admin";
import { buildNewProductDoc } from "@/lib/api/product-helpers";
import { serializeProduct } from "@/lib/market/serialize";
import { Product, type ProductDoc } from "@/models";
import { tickerize } from "@/lib/utils";
import { CATEGORIES } from "@/types";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  ticker: z.string().trim().min(1).max(16),
  domain: z.string().trim().min(1).max(253),
  description: z.string().trim().max(4000).optional().default(""),
  category: z.enum(CATEGORIES),
  logoUrl: z.string().trim().max(2048).optional(),
  status: z.enum(["active", "paused", "upcoming", "delisted"]).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20) || 20));
    const skip = (page - 1) * limit;
    const q = searchParams.get("q")?.trim() ?? "";

    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { ticker: { $regex: q, $options: "i" } },
        { domain: { $regex: q, $options: "i" } },
      ];
    }

    const [total, rows] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort({ listedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<(ProductDoc & { createdAt?: Date })[]>(),
    ]);

    return NextResponse.json({
      products: rows.map((p) => serializeProduct(p)),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to list products.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid product payload.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const ticker = tickerize(parsed.data.ticker);
    if (!ticker) {
      return NextResponse.json({ error: "Invalid ticker." }, { status: 400 });
    }

    await connectMongo();

    const existing = await Product.findOne({ ticker }).select({ _id: 1 }).lean();
    if (existing) {
      return NextResponse.json({ error: "Ticker already exists." }, { status: 409 });
    }

    const doc = await Product.create(
      await buildNewProductDoc({
        ...parsed.data,
        ticker,
        domain: parsed.data.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
      }),
    );

    return NextResponse.json({ ok: true, product: serializeProduct(doc) }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to create product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
