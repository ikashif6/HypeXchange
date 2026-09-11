import type { MetadataRoute } from "next";
import { connectMongo } from "@/lib/mongodb/mongoose";
import { Product } from "@/models";
import { absoluteUrl } from "@/lib/utils";

const STATIC_ROUTES = [
  "/",
  "/market",
  "/ipos",
  "/leaderboard",
  "/request-listing",
  "/terms",
  "/privacy",
  "/disclaimer",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/" || path === "/market" ? "hourly" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    await connectMongo();
    const products = await Product.find({
      status: { $in: ["active", "paused"] },
    })
      .select({ slug: 1, updatedAt: 1 })
      .lean();

    productEntries = products.map((product) => ({
      url: absoluteUrl(`/market/${product.slug}`),
      lastModified:
        product.updatedAt instanceof Date ? product.updatedAt : now,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    }));
  } catch {
    productEntries = [];
  }

  return [...staticEntries, ...productEntries];
}
