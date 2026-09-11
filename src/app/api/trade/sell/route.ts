import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { executeSellTrade, getSellEstimate } from "@/lib/market/trade";

const bodySchema = z.object({
  productId: z.string().min(1),
  shares: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.profileId) {
      return NextResponse.json({ error: "Sign in to trade." }, { status: 401 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid trade request." }, { status: 400 });
    }

    const result = await executeSellTrade({
      profileId: session.user.profileId,
      productId: parsed.data.productId,
      shares: parsed.data.shares,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Trade failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const shares = Number(searchParams.get("shares"));
    if (!productId || !Number.isFinite(shares)) {
      return NextResponse.json({ error: "productId and shares required" }, { status: 400 });
    }
    const estimate = await getSellEstimate(productId, shares);
    return NextResponse.json(estimate);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Estimate failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
