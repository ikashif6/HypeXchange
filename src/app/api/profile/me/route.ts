import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { getPortfolio } from "@/lib/market/queries";
import { serializeProfile } from "@/lib/market/serialize";
import { Profile, type ProfileDoc } from "@/models";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.profileId) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    await connectMongo();

    const profile = await Profile.findById(session.user.profileId).lean<
      ProfileDoc & { createdAt?: Date }
    >();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const portfolio = await getPortfolio(session.user.profileId);

    return NextResponse.json({
      profile: serializeProfile(profile, {
        portfolioValue: portfolio.portfolioValue,
        returnPct: portfolio.returnPct,
        profit: portfolio.profit,
      }),
      welcomeSeen: Boolean(profile.welcomeSeen),
      portfolio,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
