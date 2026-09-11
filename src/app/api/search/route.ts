import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/market/queries";

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 1) return NextResponse.json({ results: [], emptyQuery: true });
    const results = await searchProducts(q, 8);
    return NextResponse.json({ results, query: q });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: message, results: [] }, { status: 500 });
  }
}
