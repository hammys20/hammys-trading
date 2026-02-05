import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
