import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  hideFooter?: boolean;
}

export function AppShell({
  children,
  className,
  contentClassName,
  hideFooter = false,
}: AppShellProps) {
  return (
    <div className={cn("flex min-h-dvh flex-1 flex-col overflow-x-clip bg-hx-bg", className)}>
      <Header />
      <main
        className={cn(
          "hx-container min-w-0 flex-1 py-4 md:py-6",
          "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8",
          contentClassName,
        )}
      >
        {children}
      </main>
      {!hideFooter ? <Footer /> : null}
      <MobileNav />
    </div>
  );
}
