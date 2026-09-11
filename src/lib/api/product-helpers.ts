import { Product } from "@/models";
import { slugify } from "@/lib/utils";
import { toDecimal128 } from "@/lib/formatting/mongo-decimal";
import {
  DEFAULT_CASH_RESERVE,
  DEFAULT_SHARE_RESERVE,
  type Category,
  type ProductStatus,
} from "@/types";

const STARTING_PRICE = 10;

export async function uniqueProductSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "product";
  let slug = base;
  let attempt = 0;

  while (true) {
    const existing = await Product.findOne({ slug }).select({ _id: 1 }).lean();
    if (!existing || (excludeId && existing._id.toString() === excludeId)) {
      return slug;
    }
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
}

export function productReserveDefaults() {
  return {
    cashReserve: toDecimal128(DEFAULT_CASH_RESERVE),
    shareReserve: toDecimal128(DEFAULT_SHARE_RESERVE),
    initialCashReserve: toDecimal128(DEFAULT_CASH_RESERVE),
    initialShareReserve: toDecimal128(DEFAULT_SHARE_RESERVE),
    startingPrice: toDecimal128(STARTING_PRICE),
    currentPrice: toDecimal128(STARTING_PRICE),
    volume24h: toDecimal128(0),
    allTimeHigh: toDecimal128(STARTING_PRICE),
    holdersCount: 0,
    listedAt: new Date(),
  };
}

export type CreateProductInput = {
  name: string;
  ticker: string;
  domain: string;
  description?: string;
  category: Category;
  logoUrl?: string;
  status?: ProductStatus;
  verified?: boolean;
};

export async function buildNewProductDoc(input: CreateProductInput) {
  const slug = await uniqueProductSlug(input.name);
  return {
    name: input.name.trim(),
    ticker: input.ticker.toUpperCase().trim(),
    slug,
    domain: input.domain.toLowerCase().trim(),
    description: input.description?.trim() ?? "",
    category: input.category,
    logoUrl: input.logoUrl?.trim() ?? "",
    verified: input.verified ?? true,
    status: input.status ?? "active",
    ...productReserveDefaults(),
  };
}

/** Minimal CSV parser for header + rows (supports quoted fields). */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cells = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim();
    });
    rows.push(row);
  }

  return rows;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}
