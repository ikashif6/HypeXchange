import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { ListingRequestForm } from "@/app/request-listing/listing-request-form";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Request a listing",
  description: "Suggest an internet product for the fictional HypeXchange market.",
};

export default async function RequestListingPage() {
  const session = await auth();

  if (!session?.user?.profileId) {
    return (
      <div className="mx-auto max-w-md py-16">
        <EmptyState
          title="Sign in to request a listing"
          description="Suggest products for the entertainment market."
          action={
            <Link
              href="/auth/signin?callbackUrl=/request-listing"
              className="btn-raised inline-flex h-10 items-center justify-center rounded-[9px] px-4 text-sm font-medium"
            >
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-hx-text sm:text-2xl">
          Request a listing
        </h1>
        <p className="text-sm text-hx-secondary">
          Suggest an internet product for the fictional market. Listings are not real
          IPOs and create no ownership rights.
        </p>
      </div>
      <ListingRequestForm />
    </div>
  );
}
