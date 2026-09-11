"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Bookmark,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  X,
} from "lucide-react";
import { formatIxD } from "@/lib/formatting/decimal";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/layout/global-search";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/market", label: "Market" },
  { href: "/ipos", label: "IPOs" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/leaderboard", label: "Leaderboard" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [avatarOpen, setAvatarOpen] = React.useState(false);
  const avatarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    setMenuOpen(false);
    setAvatarOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!avatarRef.current?.contains(target)) setAvatarOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useBodyScrollLock(menuOpen);

  const user = session?.user;
  const cash = user?.cashBalance ?? 0;

  return (
    <>
      <header className="z-40 border-b border-hx-border bg-hx-card/95 backdrop-blur-[2px]">
        <div className="hx-container flex h-14 items-center gap-2 sm:gap-3">
          <BrandLogo className="shrink-0" priority />

          {/* Desktop / laptop nav: visible on PC */}
          <nav className="ml-4 hidden items-center gap-0.5 md:ml-6 md:flex lg:ml-8">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/" || pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-[8px] px-2 py-1.5 text-sm font-medium transition-colors lg:px-2.5",
                    active
                      ? "bg-hx-bg text-hx-text"
                      : "text-hx-secondary hover:bg-hx-bg hover:text-hx-text",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mx-auto hidden h-9 w-full max-w-md items-center gap-2 rounded-[9px] border border-hx-border bg-hx-bg px-3 text-left text-sm text-hx-muted transition-colors hover:border-hx-primary/30 lg:flex"
          >
            <Search className="size-3.5 shrink-0" aria-hidden />
            <span className="flex-1 truncate">Search products…</span>
            <kbd className="rounded border border-hx-border bg-hx-card px-1.5 py-0.5 font-mono text-[10px] text-hx-muted">
              /
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hx-icon-btn hidden md:inline-flex lg:hidden"
              aria-label="Search"
            >
              <Search className="size-4" />
            </button>

            <Link
              href="/founders"
              className="hidden h-9 shrink-0 items-center rounded-[9px] border border-hx-border bg-hx-card px-3 text-xs font-medium text-hx-text hover:bg-hx-bg sm:inline-flex"
            >
              Visit founders page
            </Link>

            <span className="hidden md:inline-flex">
              <ThemeToggle variant="icon" />
            </span>

            <Link
              href="/watchlist"
              className="hx-icon-btn inline-flex"
              aria-label="Watchlist"
            >
              <Bookmark className="size-4" />
            </Link>

            {status === "authenticated" && user ? (
              <>
                <Link
                  href="/portfolio"
                  className="hidden rounded-[9px] border border-hx-border bg-hx-bg px-2.5 py-1.5 font-mono-num text-xs font-medium text-hx-text sm:inline-flex"
                >
                  {formatIxD(cash, { digits: 2 })}
                </Link>

                <div className="relative" ref={avatarRef}>
                  <button
                    type="button"
                    onClick={() => setAvatarOpen((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-[9px] p-0.5 hover:bg-hx-bg"
                    aria-expanded={avatarOpen}
                    aria-haspopup="menu"
                  >
                    {user.username ? (
                      <UserAvatar
                        username={user.username}
                        displayName={user.displayName ?? user.name ?? undefined}
                        avatarUrl={user.avatarUrl}
                        size="sm"
                      />
                    ) : (
                      <span className="inline-flex size-8 items-center justify-center rounded-full border border-hx-border bg-hx-bg text-hx-muted" />
                    )}
                    <ChevronDown className="hidden size-3.5 text-hx-muted sm:block" />
                  </button>

                  {avatarOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 mt-1.5 w-48 overflow-hidden rounded-[10px] border border-hx-border bg-hx-card py-1 shadow-sm"
                    >
                      <div className="border-b border-hx-border px-3 py-2">
                        <p className="truncate text-sm font-medium text-hx-text">
                          {user.displayName ?? user.name ?? "Trader"}
                        </p>
                        <p className="truncate text-[11px] text-hx-muted">
                          @{user.username ?? "user"}
                        </p>
                      </div>
                      <Link
                        href="/portfolio"
                        className="block px-3 py-2 text-sm text-hx-secondary hover:bg-hx-bg hover:text-hx-text"
                        role="menuitem"
                      >
                        Portfolio
                      </Link>
                      <Link
                        href={user.username ? `/u/${user.username}` : "/portfolio"}
                        className="block px-3 py-2 text-sm text-hx-secondary hover:bg-hx-bg hover:text-hx-text"
                        role="menuitem"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-hx-negative hover:bg-hx-bg"
                      >
                        <LogOut className="size-3.5" />
                        Sign out
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-raised inline-flex h-9 shrink-0 items-center rounded-[9px] px-3.5 text-sm font-medium"
              >
                Sign in
              </Link>
            )}

            <button
              type="button"
              className="hx-icon-btn inline-flex md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-sidebar"
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          aria-label="Close menu"
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMenuOpen(false)}
        />

        <aside
          id="mobile-nav-sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col border-l border-hx-border bg-hx-card shadow-xl transition-transform duration-200 ease-out",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-hx-border px-4">
            <p className="text-sm font-semibold text-hx-text">Menu</p>
            <button
              type="button"
              className="hx-icon-btn inline-flex"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
            <ul className="space-y-0.5">
              {NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/" || pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "block rounded-[10px] px-3.5 py-3 text-sm font-medium",
                        active
                          ? "bg-hx-bg text-hx-text"
                          : "text-hx-secondary hover:bg-hx-bg hover:text-hx-text",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/watchlist"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-[10px] px-3.5 py-3 text-sm font-medium text-hx-secondary hover:bg-hx-bg hover:text-hx-text"
                >
                  Watchlist
                </Link>
              </li>
            </ul>
          </nav>

          <div className="shrink-0 space-y-3 border-t border-hx-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-hx-muted">
                Appearance
              </p>
              <ThemeToggle variant="segmented" className="w-full justify-stretch [&>button]:flex-1" />
            </div>

            <Link
              href="/founders"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-full items-center justify-center rounded-[9px] border border-hx-border bg-hx-card text-sm font-medium text-hx-text hover:bg-hx-bg"
            >
              Visit founders page
            </Link>

            {status !== "authenticated" ? (
              <Link
                href="/auth/signin"
                onClick={() => setMenuOpen(false)}
                className="btn-raised inline-flex h-10 w-full items-center justify-center rounded-[9px] text-sm font-medium"
              >
                Sign in
              </Link>
            ) : null}
          </div>
        </aside>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}
