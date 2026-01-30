"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BuyNowButton from "@/components/BuyNowButton";
import { getInventoryItemPublic, type Item } from "@/lib/data/inventory";

function money(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ItemPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        if (!id) return;
        const data = await getInventoryItemPublic(id);
        if (!cancelled) setItem(data);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError(e?.message ?? "Failed to load item.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading item…</div>;
  if (error) return <div style={{ padding: 24 }}>{error}</div>;
  if (!item) return <div style={{ padding: 24 }}>Item not found.</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Link href="/inventory" style={{ opacity: 0.85 }}>
        ← Back to inventory
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 14 }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
          {item.image ? (
            <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 0.6 }}>
              No image
            </div>
          )}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>{item.name}</h1>
          <div style={{ fontSize: 18, opacity: 0.9 }}>{money(item.price)}</div>
          {item.description ? <div style={{ opacity: 0.85, lineHeight: 1.5 }}>{item.description}</div> : null}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <BuyNowButton itemId={item.id} disabled={(item.status ?? "available") !== "available"} />
            <div style={{ opacity: 0.7, fontSize: 12 }}>Status: {item.status ?? "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
