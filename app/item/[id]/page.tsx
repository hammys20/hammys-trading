"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BuyNowButton from "@/components/BuyNowButton";
import {
  getInventoryItemPublic,
  type Item,
} from "@/lib/data/inventory";

export default function ItemPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getInventoryItemPublic(id)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((err) => {
        console.error("Item load failed", err);
        if (!cancelled) setItem(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!item) return <div style={{ padding: 24 }}>Item not found</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Link href="/inventory">← Back</Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {item.image && (
          <Image
            src={item.image}
            alt={item.name}
            width={800}
            height={800}
            style={{ width: "100%", height: "auto" }}
          />
        )}

        <div>
          <h1>{item.name}</h1>
          <div>${item.price ?? "—"}</div>
          <p>{item.description}</p>
          <BuyNowButton itemId={item.id} />
        </div>
      </div>
    </div>
  );
}
