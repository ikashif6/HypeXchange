import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { getWatchlist } from "@/lib/market/queries";
import { Product, Watchlist } from "@/models";

const bodySchema = z.object({
  productId: z.string().min(1),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.profileId) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const products = await getWatchlist(session.user.profileId);
    return NextResponse.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load watchlist.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.profileId) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "productId is required." }, { status: 400 });
    }

    await connectMongo();

    if (!Types.ObjectId.isValid(parsed.data.productId)) {
      return NextResponse.json({ error: "Invalid productId." }, { status: 400 });
    }

    const product = await Product.findById(parsed.data.productId).select({ _id: 1 }).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    await Watchlist.updateOne(
      {
        userId: new Types.ObjectId(session.user.profileId),
        productId: product._id,
      },
      {
        $setOnInsert: {
          userId: new Types.ObjectId(session.user.profileId),
          productId: product._id,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add to watchlist.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.profileId) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "productId is required." }, { status: 400 });
    }

    await connectMongo();

    if (!Types.ObjectId.isValid(parsed.data.productId)) {
      return NextResponse.json({ error: "Invalid productId." }, { status: 400 });
    }

    await Watchlist.deleteOne({
      userId: new Types.ObjectId(session.user.profileId),
      productId: new Types.ObjectId(parsed.data.productId),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove from watchlist.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
