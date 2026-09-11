import { NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { AdminAuthError, requireAdmin } from "@/lib/api/require-admin";
import { parseCsv, productReserveDefaults, uniqueProductSlug } from "@/lib/api/product-helpers";
import { Product } from "@/models";
import { tickerize } from "@/lib/utils";
import { CATEGORIES, type Category } from "@/types";

const jsonSchema = z.object({
  csv: z.string().min(1),
});

const categorySet = new Set<string>(CATEGORIES);

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const contentType = req.headers.get("content-type") ?? "";
    let csvText: string;

    if (contentType.includes("application/json")) {
      const parsed = jsonSchema.safeParse(await req.json());
      if (!parsed.success) {
        return NextResponse.json({ error: "Expected JSON body { csv: string }." }, { status: 400 });
      }
      csvText = parsed.data.csv;
    } else {
      csvText = await req.text();
      if (!csvText.trim()) {
        return NextResponse.json({ error: "Expected CSV text body." }, { status: 400 });
      }
    }

    await connectMongo();

    const rows = parseCsv(csvText);
    let imported = 0;
    let skipped = 0;
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const rowNumber = i + 2; // header is line 1

      try {
        const name = (row.name ?? "").trim();
        const tickerRaw = (row.ticker ?? "").trim();
        const domain = (row.domain ?? "")
          .trim()
          .toLowerCase()
          .replace(/^https?:\/\//, "")
          .replace(/\/.*$/, "");
        const description = (row.description ?? "").trim();
        const category = (row.category ?? "").trim() as Category;
        const logoUrl = (row.logo_url ?? row.logourl ?? "").trim();

        if (!name || !tickerRaw || !domain || !category) {
          skipped += 1;
          errors.push({
            row: rowNumber,
            error: "Missing required fields (name, ticker, domain, category).",
          });
          continue;
        }

        if (!categorySet.has(category)) {
          skipped += 1;
          errors.push({ row: rowNumber, error: `Invalid category: ${category}` });
          continue;
        }

        const ticker = tickerize(tickerRaw);
        if (!ticker) {
          skipped += 1;
          errors.push({ row: rowNumber, error: "Invalid ticker." });
          continue;
        }

        const existing = await Product.findOne({ ticker });
        if (existing) {
          existing.name = name;
          existing.domain = domain;
          existing.description = description;
          existing.category = category;
          if (logoUrl) existing.logoUrl = logoUrl;
          existing.slug = await uniqueProductSlug(name, existing._id.toString());
          await existing.save();
          imported += 1;
          continue;
        }

        const reserves = productReserveDefaults();
        await Product.create({
          name,
          ticker,
          slug: await uniqueProductSlug(name),
          domain,
          description,
          category,
          logoUrl,
          verified: true,
          status: "active",
          ...reserves,
        });
        imported += 1;
      } catch (err) {
        skipped += 1;
        errors.push({
          row: rowNumber,
          error: err instanceof Error ? err.message : "Row failed.",
        });
      }
    }

    return NextResponse.json({ imported, skipped, errors });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Import failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
