"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SignInForm({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      const result = await signIn("resend", {
        email: email.trim().toLowerCase(),
        callbackUrl,
        redirect: false,
      });
      if (result?.error) {
        setFormError("Could not send the magic link. Check your email and try again.");
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch {
      setFormError("Could not send the magic link. Please try again.");
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Card
        className={cn(
          "rounded-[16px] border-hx-border/80 shadow-[0_16px_48px_rgba(17,18,23,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)]",
          className,
        )}
      >
        <CardHeader className="border-b-0 px-6 pt-7 pb-2 text-center sm:px-8">
          <CardTitle className="text-2xl tracking-tight">Check your email</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            We sent a sign-in link to{" "}
            <span className="font-medium text-hx-text">{email}</span>. Open it to
            continue on HypeXchange.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-7 pt-4 sm:px-8">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => setSent(false)}
          >
            Use a different email
          </Button>
          <p className="text-center text-[12px] leading-relaxed text-hx-muted">
            Didn&apos;t get it? Check spam, or request another link.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Card className="rounded-[16px] border-hx-border/80 shadow-[0_16px_48px_rgba(17,18,23,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
        <CardHeader className="border-b-0 px-6 pt-7 pb-2 text-center sm:px-8">
          <CardTitle className="text-2xl tracking-tight">Log in</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            By continuing, you agree this is entertainment only. IXD is fictional and
            not real money or equity. See our{" "}
            <Link href="/terms" className="font-medium text-hx-link underline-offset-4 hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-hx-link underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-7 pt-4 sm:px-8">
          <form onSubmit={onEmailSubmit} className="flex flex-col gap-4">
            {(error || formError) && (
              <p className="rounded-[9px] bg-hx-negative-subtle px-3 py-2 text-xs text-hx-negative">
                {formError || "Authentication error. Please try again."}
              </p>
            )}

            <Input
              label="Email"
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com"
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Email me a magic link
            </Button>

            <p className="text-center text-[12px] leading-relaxed text-hx-secondary">
              New to HypeXchange?{" "}
              <span className="font-medium text-hx-text">The same link creates your account</span>{" "}
              with 10,000 IXD.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
