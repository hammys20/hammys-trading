import { ImageResponse } from "next/og";
import { getInventoryItemPublic } from "@/lib/data/inventory";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type PageProps = {
  params: { id: string };
};

function formatPrice(price?: number) {
  if (typeof price !== "number") return "Price on listing";
  return price.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function resolvePublicImage(item: {
  image?: string;
  images?: string[];
}) {
  const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
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
  return `${siteUrl}/hero-cards.png`;
}

async function loadImage(url?: string) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image({ params }: PageProps) {
  const item = params?.id ? await getInventoryItemPublic(params.id) : null;
  const imageUrl = item ? resolvePublicImage(item) : undefined;
  const imageBuffer = await loadImage(imageUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 48,
          gap: 36,
          background:
            "radial-gradient(1200px 600px at 5% -10%, #f2d9b1 0%, rgba(242,217,177,0) 60%), linear-gradient(135deg, #0d0f12 0%, #1a1d26 60%, #141821 100%)",
          color: "white",
          fontSize: 24,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, opacity: 0.8 }}>Hammy’s Trading</div>
          <div
            style={{
              marginTop: 16,
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.05,
              maxHeight: 260,
              overflow: "hidden",
            }}
          >
            {item?.name ?? "Trading Card"}
          </div>
          <div style={{ marginTop: 18, fontSize: 26, opacity: 0.9 }}>
            {item?.set ?? "Collector Favorite"}
          </div>
          <div style={{ marginTop: "auto", fontSize: 28, fontWeight: 700 }}>
            {formatPrice(item?.price)}
          </div>
        </div>

        <div
          style={{
            width: 420,
            height: 520,
            borderRadius: 28,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageBuffer ? (
            <img
              src={imageBuffer as unknown as string}
              width={420}
              height={520}
              style={{ objectFit: "contain" }}
              alt=""
            />
          ) : (
            <div style={{ opacity: 0.7 }}>Image coming soon</div>
          )}
        </div>
      </div>
    ),
    size
  );
}
