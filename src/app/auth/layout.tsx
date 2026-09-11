import type { ReactNode } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";

/** Full-screen auth chrome: top logo bar + patterned backdrop (covers app shell). */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-hx-bg">
      <header className="relative z-20 flex h-14 shrink-0 items-center border-b border-hx-border bg-hx-card px-4 sm:px-6">
        <BrandLogo className="[&_img]:h-7 [&_img]:sm:h-8" priority />
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div
          className="hx-auth-pattern pointer-events-none absolute inset-0"
          aria-hidden
        />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 md:py-14">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
