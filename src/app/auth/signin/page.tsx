import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/app/auth/signin/signin-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to HypeXchange and start with 10,000 IXD.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full rounded-[14px]" />}>
      <SignInForm />
    </Suspense>
  );
}
