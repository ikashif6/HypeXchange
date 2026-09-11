"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeBanner({ displayName }: { displayName?: string }) {
  const router = useRouter();
  const [dismissing, setDismissing] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  async function dismiss() {
    setDismissing(true);
    try {
      await fetch("/api/profile/welcome", { method: "POST" });
      setHidden(true);
      router.refresh();
    } catch {
      setDismissing(false);
    }
  }

  if (hidden) return null;

  return (
    <div className="relative overflow-hidden rounded-[10px] border border-hx-primary/20 bg-hx-primary-subtle px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-hx-primary text-white">
            <Sparkles className="size-4" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-hx-text">
              Welcome{displayName ? `, ${displayName}` : ""}. You have 10,000 IXD
            </p>
            <p className="mt-0.5 text-xs text-hx-secondary">
              This is fictional cash for playing the market, not real money or equity.{" "}
              <Link href="/auth/welcome" className="font-medium text-hx-link hover:underline">
                Learn more
              </Link>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <Link
            href="/market"
            className="btn-raised inline-flex h-9 items-center justify-center rounded-[9px] px-3.5 text-sm font-medium"
          >
            Explore Market
          </Link>
          <Button
            variant="ghost"
            size="sm"
            loading={dismissing}
            onClick={dismiss}
            aria-label="Dismiss welcome"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
