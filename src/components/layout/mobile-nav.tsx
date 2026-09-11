"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, LayoutGrid, Search, UserRound, CandlestickChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/layout/global-search";

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = React.useState(false);

  const profileHref = session?.user?.username
    ? `/u/${session.user.username}`
    : "/auth/signin";

  const items = [
    { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    {
      href: "/market",
      label: "Market",
      icon: CandlestickChart,
      match: (p: string) => p.startsWith("/market"),
    },
    {
      href: "__search__",
      label: "Search",
      icon: Search,
      match: () => false,
    },
    {
      href: "/portfolio",
      label: "Portfolio",
      icon: LayoutGrid,
      match: (p: string) => p.startsWith("/portfolio"),
    },
    {
      href: profileHref,
      label: "Profile",
      icon: UserRound,
      match: (p: string) => p.startsWith("/u/") || p.startsWith("/auth"),
    },
  ] as const;

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-hx-border bg-hx-card pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Mobile"
      >
        <ul className="grid h-14 grid-cols-5">
          {items.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;

            if (item.href === "__search__") {
              return (
                <li key="search">
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className={cn(
                      "flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                      searchOpen ? "text-hx-link" : "text-hx-muted hover:text-hx-secondary",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                    {item.label}
                  </button>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                    active ? "text-hx-link" : "text-hx-muted hover:text-hx-secondary",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
