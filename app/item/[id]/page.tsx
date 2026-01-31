"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import outputs from "@/amplify_outputs.json";
import { useParams } from "next/navigation";
import BuyNowButton from "@/components/BuyNowButton";
import AddToCartButton from "@/components/AddToCartButton";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";

function money(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ItemPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const bucket = outputs?.storage?.bucket_name ?? "";
  const region = outputs?.storage?.aws_region ?? "us-east-1";

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setErr("");
        setLoading(true);

        // Simple approach: list and find (fine for small inventories).
        const data = await listInventoryPublic();
        const arr = Array.isArray(data) ? (data as Item[]) : [];
        const found = arr.find((x) => x.id === id) ?? null;

        if (!cancelled) setItem(found);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setErr(e?.message ?? "Failed to load item.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading item…</div>;
  if (err) return <div style={{ padding: 24 }}>Error: {err}</div>;
  if (!item) return <div style={{ padding: 24 }}>Item not found.</div>;

  const img = item?.image
    ? `https://${bucket}.s3.${region}.amazonaws.com/${item.image}`
    : "";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18 }}>
        {/* IMAGE */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16,
            overflow: "hidden",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {img ? (
            // Click to open full-size in new tab
            <a href={img} target="_blank" rel="noreferrer" style={{ display: "block" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
                <Image
                  src={img}
                  alt={item.name}
                  fill
                  sizes="(max-width: 900px) 100vw, 650px"
                  style={{ objectFit: "contain" }} // show full card (not cropped)
                />
              </div>
            </a>
          ) : (
            <div style={{ padding: 24, opacity: 0.7 }}>No image</div>
          )}
        </div>

        {/* DETAILS + BUY */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16,
            padding: 16,
            background: "rgba(255,255,255,0.02)",
            display: "grid",
            gap: 10,
            alignContent: "start",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.15 }}>{item.name}</div>
          <div style={{ fontSize: 18, opacity: 0.9 }}>
            {money(item.price)} · {item.status ?? "available"}
          </div>

          {item.set ? <div style={{ opacity: 0.85 }}>{item.set}</div> : null}
          <div style={{ opacity: 0.8 }}>
            {[item.condition, item.gradingCompany, item.grade, item.language]
              .filter(Boolean)
              .join(" · ") || "—"}
          </div>
          {item.tags && item.tags.length > 0 ? (
            <div style={{ opacity: 0.75 }}>Tags: {item.tags.join(", ")}</div>
          ) : null}

          {/* IMPORTANT: button is NOT inside a Link and is in normal layout */}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <AddToCartButton
              itemId={item.id}
              disabled={(item.status ?? "available") !== "available"}
            />
            <BuyNowButton itemId={item.id} price={item.price} status={item.status} />
          </div>

          <div style={{ opacity: 0.6, fontSize: 12, marginTop: 10 }}>{item.id}</div>
        </div>
      </div>
    </div>
  );
}
