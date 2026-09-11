import Link from "next/link";
import { Search } from "lucide-react";
import {
  getMarketProducts,
  type MarketSort,
} from "@/lib/market/queries";
import { CATEGORIES, type Category, type ProductPublic } from "@/types";
import { MarketTable } from "@/components/market/market-table";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const SORTS: { id: MarketSort; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "traded", label: "Most traded" },
  { id: "newest", label: "Newest" },
  { id: "az", label: "A–Z" },
];

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const search = first(sp.q) ?? first(sp.search) ?? "";
  const category = first(sp.category) ?? "All";
  const sort = (first(sp.sort) as MarketSort | undefined) ?? "trending";
  const page = Math.max(1, Number(first(sp.page) ?? "1") || 1);

  let products: ProductPublic[] = [];
  let total = 0;
  let totalPages = 1;
  let pageSize = 24;

  try {
    const result = await getMarketProducts({
      search,
      category: category === "All" ? undefined : (category as Category),
      sort: SORTS.some((s) => s.id === sort) ? sort : "trending",
      page,
      pageSize: 24,
    });
    products = result.products;
    total = result.total;
    totalPages = result.totalPages;
    pageSize = result.pageSize;
  } catch {
    products = [];
  }

  function href(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const next = {
      q: search || undefined,
      category: category !== "All" ? category : undefined,
      sort: sort !== "trending" ? sort : undefined,
      page: page > 1 ? String(page) : undefined,
      ...overrides,
    };
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/market?${qs}` : "/market";
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
          Market
        </h1>
        <p className="text-sm text-hx-secondary">
          Browse fictional shares of internet products, with prices shown in IXD.
        </p>
      </div>

      <form action="/market" method="get" className="flex flex-col gap-3 sm:flex-row">
        {category !== "All" ? (
          <input type="hidden" name="category" value={category} />
        ) : null}
        {sort !== "trending" ? <input type="hidden" name="sort" value={sort} /> : null}
        <Input
          name="q"
          defaultValue={search}
          placeholder="Search name, ticker, or domain…"
          leftAddon={<Search className="size-3.5" aria-hidden />}
          containerClassName="flex-1"
          aria-label="Search market"
        />
        <button
          type="submit"
          className="btn-raised inline-flex h-9 items-center justify-center rounded-[9px] px-4 text-sm font-medium"
        >
          Search
        </button>
      </form>

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        <CategoryChip href={href({ category: undefined, page: undefined })} active={category === "All"}>
          All
        </CategoryChip>
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat}
            href={href({ category: cat, page: undefined })}
            active={category === cat}
          >
            {cat}
          </CategoryChip>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {SORTS.map((s) => (
            <Link
              key={s.id}
              href={href({
                sort: s.id === "trending" ? undefined : s.id,
                page: undefined,
              })}
              className={cn("hx-chip", sort === s.id && "hx-chip-active")}
              data-active={sort === s.id || undefined}
            >
              {s.label}
            </Link>
          ))}
        </div>
        <p className="font-mono-num text-xs text-hx-muted">
          {total} product{total === 1 ? "" : "s"}
        </p>
      </div>

      <MarketTable
        products={products}
        emptyTitle="No products match"
        emptyDescription="Try another search, category, or sort."
      />

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <PageLink
            href={page > 1 ? href({ page: String(page - 1) }) : null}
            label="Previous"
          />
          <span className="font-mono-num text-xs text-hx-muted">
            Page {page} of {totalPages} · {pageSize}/page
          </span>
          <PageLink
            href={page < totalPages ? href({ page: String(page + 1) }) : null}
            label="Next"
          />
        </div>
      ) : null}
    </div>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      data-active={active || undefined}
      className={cn("hx-chip", active && "hx-chip-active")}
    >
      {children}
    </Link>
  );
}

function PageLink({ href, label }: { href: string | null; label: string }) {
  if (!href) {
    return (
      <span className="inline-flex h-8 items-center rounded-[7px] px-3 text-xs text-hx-muted opacity-40">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center rounded-[7px] border border-hx-border bg-hx-card px-3 text-xs font-medium text-hx-secondary hover:bg-hx-bg hover:text-hx-text"
    >
      {label}
    </Link>
  );
}
