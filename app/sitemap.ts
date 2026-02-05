import type { MetadataRoute } from "next";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";

function parseDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const routes = [
    "",
    "/about",
    "/inventory",
    "/singles",
    "/slabs",
    "/sealed",
    "/powerpacks",
    "/consignment",
    "/whatnot",
    "/contact",
    "/terms",
    "/certification-search",
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  let items: Item[] = [];
  try {
    const data = await listInventoryPublic();
    items = Array.isArray(data) ? data : [];
  } catch {
    items = [];
  }

  const itemEntries: MetadataRoute.Sitemap = items.map((item) => ({
    url: `${siteUrl}/item/${item.id}`,
    lastModified: parseDate(item.updatedAt) ?? parseDate(item.createdAt) ?? now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...itemEntries] as MetadataRoute.Sitemap;
}
