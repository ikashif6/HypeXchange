import type { Metadata } from "next";
import Link from "next/link";
import { STARTING_CASH_IXD } from "@/types";
import { formatIxD } from "@/lib/formatting/decimal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Welcome to HypeXchange. Start with 10,000 fictional IXD.",
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return (
    <Card className="rounded-[16px] border-hx-border/80 shadow-[0_16px_48px_rgba(17,18,23,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
      <CardHeader className="border-b-0 px-6 pt-7 pb-2 text-center sm:px-8">
        <CardTitle className="text-2xl tracking-tight">Welcome to HypeXchange</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          You start with{" "}
          <span className="font-mono-num font-semibold text-hx-text">
            {formatIxD(STARTING_CASH_IXD)}
          </span>
          . Trade fictional shares of internet products for entertainment.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-6 pb-7 pt-4 sm:px-8">
        <Link
          href="/market"
          className="btn-raised inline-flex h-11 w-full items-center justify-center rounded-[9px] text-sm font-medium"
        >
          Explore market
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 w-full items-center justify-center rounded-[9px] border border-hx-border bg-hx-card text-sm font-medium text-hx-text hover:bg-hx-bg"
        >
          Go to dashboard
        </Link>
        <p className="text-center text-[11px] leading-relaxed text-hx-muted">
          IXD is not real money or equity. You cannot deposit or withdraw.
        </p>
      </CardContent>
    </Card>
  );
}
