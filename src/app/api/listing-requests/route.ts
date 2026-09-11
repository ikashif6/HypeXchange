import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { ListingRequest } from "@/models";
import { tickerize } from "@/lib/utils";
import { CATEGORIES } from "@/types";

const bodySchema = z.object({
  productName: z.string().trim().min(1).max(120),
  domain: z.string().trim().min(1).max(253),
  suggestedTicker: z.string().trim().min(1).max(16),
  description: z.string().trim().max(2000).optional().default(""),
  category: z.enum(CATEGORIES),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.profileId) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid listing request.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const ticker = tickerize(parsed.data.suggestedTicker);
    if (!ticker) {
      return NextResponse.json({ error: "Invalid suggested ticker." }, { status: 400 });
    }

    await connectMongo();

    const doc = await ListingRequest.create({
      userId: new Types.ObjectId(session.user.profileId),
      productName: parsed.data.productName,
      domain: parsed.data.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
      suggestedTicker: ticker,
      description: parsed.data.description,
      category: parsed.data.category,
      status: "pending",
    });

    return NextResponse.json({
      ok: true,
      id: doc._id.toString(),
      status: doc.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create listing request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
