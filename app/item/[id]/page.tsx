import type { Metadata } from "next";
import Script from "next/script";
import { getInventoryItemPublic } from "@/lib/data/inventory";
import ItemPageClient from "@/components/ItemPageClient";

type PageProps = {
  params: { id: string };
};

function formatTitle(itemName: string) {
  return `${itemName} | Hammy’s Trading`;
}

function formatDescription(item: {
  name?: string;
  set?: string;
  grade?: string;
  gradingCompany?: string;
  condition?: string;
  language?: string;
}) {
  const bits = [
    item.set,
    item.gradingCompany ? `${item.gradingCompany}${item.grade ? ` ${item.grade}` : ""}` : item.grade,
    item.condition,
    item.language,
  ].filter(Boolean);
  const detail = bits.length > 0 ? ` (${bits.join(" · ")})` : "";
  return `Shop ${item.name ?? "trading card"}${detail} at Hammy’s Trading. Trusted, curated, and fairly priced for collectors.`;
}

function resolveOgImage(item: {
  image?: string;
  images?: string[];
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

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
  return "/hero-cards.png";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const item = params?.id ? await getInventoryItemPublic(params.id) : null;

  if (!item) {
    return {
      title: "Card Not Found",
      description: "This trading card listing could not be found.",
      alternates: siteUrl
        ? { canonical: `${siteUrl}/item/${params?.id ?? ""}` }
        : undefined,
    };
  }

  const ogImage = resolveOgImage({
    image: item.image,
    images: item.images,
  });
  const ogRoute = siteUrl ? `${siteUrl}/item/${item.id}/opengraph-image` : undefined;

  return {
    title: formatTitle(item.name ?? "Trading Card"),
    description: formatDescription(item),
    alternates: siteUrl
      ? { canonical: `${siteUrl}/item/${item.id}` }
      : undefined,
    openGraph: {
      title: item.name ?? "Trading Card",
      description: formatDescription(item),
      url: siteUrl ? `${siteUrl}/item/${item.id}` : undefined,
      images: (ogRoute || ogImage)
        ? [
            {
              url: ogRoute ?? ogImage,
              alt: item.name ?? "Trading card",
            },
            ...(ogImage && ogRoute
              ? [
                  {
                    url: ogImage,
                    alt: item.name ?? "Trading card",
                  },
                ]
              : []),
          ]
        : undefined,
    },
    twitter: {
      title: item.name ?? "Trading Card",
      description: formatDescription(item),
      images: ogRoute ? [ogRoute] : ogImage ? [ogImage] : undefined,
    },
  };
}

function availabilityUrl(status?: string) {
  return status === "available"
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

export default async function ItemPage({ params }: PageProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const item = params?.id ? await getInventoryItemPublic(params.id) : null;
  const ogImage = item
    ? resolveOgImage({ image: item.image, images: item.images })
    : undefined;

  const productJsonLd = item
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: item.name,
        image: ogImage ? [ogImage] : undefined,
        description: formatDescription(item),
        sku: item.id,
        brand: { "@type": "Brand", name: "Hammy’s Trading" },
        offers:
          typeof item.price === "number"
            ? {
                "@type": "Offer",
                price: item.price,
                priceCurrency: "USD",
                availability: availabilityUrl(item.status),
                url: siteUrl ? `${siteUrl}/item/${item.id}` : undefined,
              }
            : undefined,
      }
    : null;

  return (
    <>
      {productJsonLd ? (
        <Script
          id="item-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      ) : null}
      <ItemPageClient />
    </>
  );
}
