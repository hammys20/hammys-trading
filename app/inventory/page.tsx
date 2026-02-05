import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import InventoryPageClient from "@/components/InventoryPageClient";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const CATEGORY_VALUES = new Set(["pokemon", "sports"]);
const STATUS_VALUES = new Set(["available", "sold"]);
const GRADING_VALUES = new Set(["PSA", "BGS", "CGC"]);
const GRADE_VALUES = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
const LANGUAGE_VALUES = new Set([
  "English",
  "Japanese",
  "Korean",
  "Chinese",
  "French",
  "German",
  "Italian",
  "Spanish",
  "Portuguese",
  "Indonesian",
  "Thai",
]);

function getSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function buildCanonical(searchParams?: PageProps["searchParams"]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return undefined;

  const category = getSingleParam(searchParams?.category)?.toLowerCase();
  const status = getSingleParam(searchParams?.status)?.toLowerCase();
  const grading = getSingleParam(searchParams?.grading);
  const grade = getSingleParam(searchParams?.grade);
  const language = getSingleParam(searchParams?.language);

  const params = new URLSearchParams();

  if (category && CATEGORY_VALUES.has(category)) params.set("category", category);
  if (status && STATUS_VALUES.has(status)) params.set("status", status);
  if (grading && GRADING_VALUES.has(grading.toUpperCase()))
    params.set("grading", grading.toUpperCase());
  if (grade && GRADE_VALUES.has(grade)) params.set("grade", grade);
  if (language && LANGUAGE_VALUES.has(language)) params.set("language", language);

  const qs = params.toString();
  return qs ? `${siteUrl}/inventory?${qs}` : `${siteUrl}/inventory`;
}

function resolvePublicImage(item: Item) {
  const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const raw =
    (Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : item.image) ?? "";

  if (raw && /^https?:\/\//i.test(raw)) return raw;
  if (raw && imageBase) {
    const base = imageBase.replace(/\/+$/, "");
    const path = raw.replace(/^\/+/, "");
    return `${base}/${path}`;
  }
  if (siteUrl) return `${siteUrl}/hero-cards.png`;
  return undefined;
}

function availabilityUrl(status?: string) {
  return status === "available"
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const canonical = buildCanonical(searchParams);
  return {
    title: "Inventory",
    description:
      "Browse trading card inventory from Hammy’s Trading — Pokemon and sports singles, graded slabs, and collector favorites.",
    keywords: [
      "trading card inventory",
      "pokemon singles",
      "sports card singles",
      "graded cards",
      "slabs",
      "Hammy’s Trading",
    ],
    alternates: canonical ? { canonical } : undefined,
  };
}

export default async function InventoryPage() {
  let items: Item[] = [];
  try {
    const data = await listInventoryPublic();
    items = Array.isArray(data) ? data : [];
  } catch {
    items = [];
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const itemListElement = items.slice(0, 20).map((item, index) => {
    const url = siteUrl ? `${siteUrl}/item/${item.id}` : undefined;
    const image = resolvePublicImage(item);
    return {
      "@type": "ListItem",
      position: index + 1,
      url,
      item: {
        "@type": "Product",
        name: item.name,
        image: image ? [image] : undefined,
        sku: item.id,
        brand: { "@type": "Brand", name: "Hammy’s Trading" },
        offers:
          typeof item.price === "number"
            ? {
                "@type": "Offer",
                price: item.price,
                priceCurrency: "USD",
                availability: availabilityUrl(item.status),
                url,
              }
            : undefined,
      },
    };
  });

  const itemListJsonLd =
    itemListElement.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Trading Card Inventory",
          numberOfItems: items.length,
          itemListElement,
        }
      : null;

  return (
    <>
      {itemListJsonLd ? (
        <Script
          id="inventory-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      <Suspense fallback={<div style={{ padding: 24 }}>Loading inventory…</div>}>
        <InventoryPageClient />
      </Suspense>
    </>
  );
}
