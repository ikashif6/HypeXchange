import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { AdminAuthError, requireAdmin } from "@/lib/api/require-admin";
import { uniqueProductSlug } from "@/lib/api/product-helpers";
import { serializeProduct } from "@/lib/market/serialize";
import { Product } from "@/models";
import { slugify, tickerize } from "@/lib/utils";
import { CATEGORIES } from "@/types";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  ticker: z.string().trim().min(1).max(16).optional(),
  domain: z.string().trim().min(1).max(253).optional(),
  description: z.string().trim().max(4000).optional(),
  category: z.enum(CATEGORIES).optional(),
  logoUrl: z.string().trim().max(2048).optional(),
  status: z.enum(["active", "paused", "upcoming", "delisted"]).optional(),
  verified: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update payload.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await connectMongo();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const data = parsed.data;

    if (data.name !== undefined) {
      product.name = data.name;
      product.slug = await uniqueProductSlug(data.name, product._id.toString());
    }
    if (data.ticker !== undefined) {
      const ticker = tickerize(data.ticker);
      if (!ticker) {
        return NextResponse.json({ error: "Invalid ticker." }, { status: 400 });
      }
      const clash = await Product.findOne({ ticker, _id: { $ne: product._id } })
        .select({ _id: 1 })
        .lean();
      if (clash) {
        return NextResponse.json({ error: "Ticker already exists." }, { status: 409 });
      }
      product.ticker = ticker;
    }
    if (data.domain !== undefined) {
      product.domain = data.domain
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");
    }
    if (data.description !== undefined) product.description = data.description;
    if (data.category !== undefined) product.category = data.category;
    if (data.logoUrl !== undefined) product.logoUrl = data.logoUrl;
    if (data.status !== undefined) product.status = data.status;
    if (data.verified !== undefined) product.verified = data.verified;

    // Keep slug in sync if only name wasn't patched but slugify base drifted (no-op otherwise).
    if (data.name === undefined && !product.slug) {
      product.slug = slugify(product.name);
    }

    await product.save();

    return NextResponse.json({ ok: true, product: serializeProduct(product) });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to update product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
    }

    await connectMongo();

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to delete product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
