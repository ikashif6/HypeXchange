import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb/client";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { Profile } from "@/models";
import { STARTING_CASH_IXD } from "@/types";
import { toDecimal128 } from "@/lib/formatting/mongo-decimal";
import { slugify } from "@/lib/utils";
import { buildMagicLinkEmail } from "@/lib/email/templates";
import { resolveAvatarUrl } from "@/lib/avatar";

async function ensureProfile(params: {
  userId: string;
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  await connectMongo();

  const existing = await Profile.findOne({
    $or: [{ userId: params.userId }, { email: params.email.toLowerCase() }],
  });
  if (existing) {
    if (!existing.userId || existing.userId.toString() !== params.userId) {
      existing.userId = params.userId;
      await existing.save();
    }
    return existing;
  }

  const base =
    slugify(params.name || params.email.split("@")[0] || "trader").replace(/-/g, "") ||
    "trader";
  let username = base.slice(0, 24);
  let attempt = 0;

  while (await Profile.findOne({ username })) {
    attempt += 1;
    username = `${base.slice(0, 20)}${attempt}`;
  }

  return Profile.create({
    userId: params.userId,
    email: params.email.toLowerCase(),
    username,
    displayName: params.name?.trim() || username,
    avatarUrl: params.image || "",
    cashBalance: toDecimal128(STARTING_CASH_IXD),
    role: "user",
    welcomeSeen: false,
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: process.env.MONGODB_URI ? MongoDBAdapter(clientPromise) : undefined,
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM || "HypeXchange <noreply@hypexchange.space>",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { subject, html, text } = buildMagicLinkEmail({
          url,
          email: identifier,
        });

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject,
            html,
            text,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Resend error: ${res.status} ${body}`);
        }
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        try {
          const profile = await ensureProfile({
            userId: user.id,
            email: user.email ?? session.user.email ?? "",
            name: user.name,
            image: user.image,
          });
          session.user.profileId = profile._id.toString();
          session.user.username = profile.username;
          session.user.role = profile.role;
          session.user.cashBalance = Number(profile.cashBalance.toString());
          session.user.welcomeSeen = profile.welcomeSeen;
          session.user.displayName = profile.displayName;
          session.user.avatarUrl = resolveAvatarUrl(
            profile.avatarUrl || user.image,
            profile.username,
          );
        } catch {
          // DB may be unavailable during build
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id || !user.email) return;
      await ensureProfile({
        userId: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      });
    },
  },
  secret: process.env.AUTH_SECRET,
});
