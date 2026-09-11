"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, Search } from "lucide-react";
import type { ProductPublic } from "@/types";
import { formatPrice } from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";
import { ProductLogo } from "@/components/product/product-logo";
import { ChangeBadge } from "@/components/product/change-badge";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

export interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ProductPublic[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  useBodyScrollLock(open);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults((data.results as ProductPublic[]) ?? []);
        setActiveIndex(0);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, open]);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  function goTo(slug: string) {
    onOpenChange(false);
    router.push(`/market/${slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) goTo(results[activeIndex].slug);
      else if (query.trim()) {
        onOpenChange(false);
        router.push(`/request-listing?q=${encodeURIComponent(query.trim())}`);
      }
    }
  }

  if (!open) return null;

  const trimmed = query.trim();
  const showEmpty = !loading && trimmed.length > 0 && results.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-hx-overlay"
        aria-label="Close search"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[10px] border border-hx-border bg-hx-card shadow-lg max-sm:max-h-[min(100dvh-1.5rem,640px)]"
      >
        <div className="flex items-center gap-2 border-b border-hx-border px-3">
          <Search className="size-4 shrink-0 text-hx-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search by name, ticker, or domain…"
            className="h-12 w-full bg-transparent text-sm text-hx-text outline-none placeholder:text-hx-muted"
            autoComplete="off"
            spellCheck={false}
          />
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-hx-muted" />
          ) : (
            <kbd className="hidden rounded border border-hx-border px-1.5 py-0.5 font-mono text-[10px] text-hx-muted sm:inline">
              esc
            </kbd>
          )}
        </div>

        <div className="max-h-[min(420px,55vh)] overflow-y-auto overscroll-contain p-1.5">
          {results.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => goTo(product.slug)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left",
                index === activeIndex && "bg-hx-primary-subtle",
              )}
            >
              <ProductLogo
                name={product.name}
                logoUrl={product.logoUrl}
                domain={product.domain}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-hx-text">
                  {product.name}
                </p>
                <p className="font-mono-num text-[11px] text-hx-muted">
                  ${product.ticker}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono-num text-xs font-medium text-hx-text">
                  ${formatPrice(product.currentPrice)}
                </p>
                <ChangeBadge value={product.change24h} />
              </div>
            </button>
          ))}

          {showEmpty ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-medium text-hx-text">No results for “{trimmed}”</p>
              <p className="mt-1 text-xs text-hx-secondary">
                Can&apos;t find it? Request a listing.
              </p>
              <Link
                href={`/request-listing?q=${encodeURIComponent(trimmed)}`}
                onClick={() => onOpenChange(false)}
                className="btn-raised mt-3 inline-flex items-center gap-1 rounded-[9px] px-3 py-2 text-xs font-medium"
              >
                Request listing
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          ) : null}

          {!trimmed && !loading ? (
            <p className="px-3 py-6 text-center text-xs text-hx-muted">
              Type to search the market. Press <span className="font-mono">/</span> or{" "}
              <span className="font-mono">⌘K</span> anytime.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
