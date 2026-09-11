"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/layout/theme-provider";

export interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
