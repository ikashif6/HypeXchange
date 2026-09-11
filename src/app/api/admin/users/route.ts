import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { AdminAuthError, requireAdmin } from "@/lib/api/require-admin";
import { serializeProfile } from "@/lib/market/serialize";
import { Profile, type ProfileDoc } from "@/models";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50) || 50));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: "i" } },
        { displayName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const [total, rows] = await Promise.all([
      Profile.countDocuments(filter),
      Profile.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<(ProfileDoc & { createdAt?: Date; email?: string })[]>(),
    ]);

    return NextResponse.json({
      users: rows.map((profile) => ({
        ...serializeProfile(profile),
        email: profile.email,
        welcomeSeen: Boolean(profile.welcomeSeen),
        role: profile.role,
      })),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      q: q || undefined,
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to list users.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
