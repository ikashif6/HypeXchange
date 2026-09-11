import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

export default function VerifyRequestPage() {
  return (
    <Card className="rounded-[16px] border-hx-border/80 shadow-[0_16px_48px_rgba(17,18,23,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
      <CardHeader className="border-b-0 px-6 pt-7 pb-2 text-center sm:px-8">
        <CardTitle className="text-2xl tracking-tight">Check your email</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          A magic link is on the way. Open it to sign in and claim your{" "}
          <span className="font-mono-num text-hx-text">10,000 IXD</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-7 pt-4 sm:px-8">
        <Link
          href="/auth/signin"
          className="inline-flex h-11 w-full items-center justify-center rounded-[9px] border border-hx-border bg-hx-card text-sm font-medium text-hx-text hover:bg-hx-bg"
        >
          Back to login
        </Link>
      </CardContent>
    </Card>
  );
}
