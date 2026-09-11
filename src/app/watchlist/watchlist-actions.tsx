"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ProductPublic } from "@/types";
import { Button } from "@/components/ui/button";

export function WatchlistActions({ products }: { products: ProductPublic[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<string | null>(null);

  async function remove(productId: string) {
    setBusyId(productId);
    try {
      await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {products.map((product) => (
        <Button
          key={product.id}
          variant="outline"
          size="sm"
          loading={busyId === product.id}
          onClick={() => remove(product.id)}
        >
          Remove ${product.ticker}
        </Button>
      ))}
    </div>
  );
}
