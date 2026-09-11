import { NextResponse } from "next/server";
import { z } from "zod";
import { Types } from "mongoose";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { AdminAuthError, requireAdmin } from "@/lib/api/require-admin";
import { buildNewProductDoc } from "@/lib/api/product-helpers";
import { ListingRequest, Product, Profile } from "@/models";
import { tickerize } from "@/lib/utils";

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
  adminNote: z.string().trim().max(2000).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    await connectMongo();

    const rows = await ListingRequest.find({ status: "pending" })
      .sort({ createdAt: 1 })
      .lean();

    const userIds = [
      ...new Set(rows.map((r) => r.userId.toString())),
    ].map((id) => new Types.ObjectId(id));
    const profiles = await Profile.find({ _id: { $in: userIds } })
      .select({ username: 1, displayName: 1, email: 1 })
      .lean();
    const profileById = new Map(profiles.map((p) => [p._id.toString(), p]));

    return NextResponse.json({
      requests: rows.map((r) => {
        const profile = profileById.get(r.userId.toString());
        const createdAt = (r as { createdAt?: Date | string }).createdAt;
        return {
          id: r._id.toString(),
          userId: r.userId.toString(),
          productName: r.productName,
          domain: r.domain,
          suggestedTicker: r.suggestedTicker,
          description: r.description ?? "",
          category: r.category,
          status: r.status,
          adminNote: r.adminNote ?? "",
          createdAt:
            createdAt instanceof Date
              ? createdAt.toISOString()
              : createdAt
                ? new Date(createdAt).toISOString()
                : null,
          user: profile
            ? {
                username: profile.username,
                displayName: profile.displayName,
                email: profile.email,
              }
            : undefined,
        };
      }),
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to list listing requests.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (!Types.ObjectId.isValid(parsed.data.id)) {
      return NextResponse.json({ error: "Invalid request id." }, { status: 400 });
    }

    await connectMongo();

    const listing = await ListingRequest.findById(parsed.data.id);
    if (!listing) {
      return NextResponse.json({ error: "Listing request not found." }, { status: 404 });
    }

    if (listing.status !== "pending") {
      return NextResponse.json({ error: "Request already reviewed." }, { status: 409 });
    }

    listing.status = parsed.data.status;
    if (parsed.data.adminNote !== undefined) {
      listing.adminNote = parsed.data.adminNote;
    }

    let productId: string | undefined;

    if (parsed.data.status === "approved") {
      const ticker = tickerize(listing.suggestedTicker) || listing.suggestedTicker.toUpperCase();
      let product = await Product.findOne({ ticker });

      if (!product) {
        product = await Product.create(
          await buildNewProductDoc({
            name: listing.productName,
            ticker,
            domain: listing.domain,
            description: listing.description ?? "",
            category: listing.category,
            status: "active",
            verified: true,
          }),
        );
      }

      productId = product._id.toString();
    }

    await listing.save();

    return NextResponse.json({
      ok: true,
      id: listing._id.toString(),
      status: listing.status,
      productId,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to update listing request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
