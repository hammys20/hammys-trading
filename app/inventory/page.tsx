"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import BuyNowButton from "@/components/BuyNowButton";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";

function money(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("available");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const data = await listInventoryPublic();
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError(e?.message ?? "Failed to load inventory.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const status = (i.status ?? "available").toLowerCase();
      if (statusFilter && status !== statusFilter) return false;
      if (q && !(i.name ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  if (loading) return <div style={{ padding: 24 }}>Loading inventory…</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Inventory</h1>

      {error ? (
        <div style={{ padding: 12, border: "1px solid rgba(255,80,80,0.4)", borderRadius: 10, marginBottom: 14 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 10, width: 320 }}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 10 }}>
          <option value="available">available</option>
          <option value="pending">pending</option>
          <option value="sold">sold</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div>No items found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((i) => (
            <div
              key={i.id}
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 14,
                overflow: "hidden",
                background: "rgba(255,255,255,0.03)",
                display: "grid",
              }}
            >
              <Link href={`/item/${i.id}`} style={{ display: "block" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", background: "rgba(255,255,255,0.04)" }}>
                  {i.image ? (
                    <Image
                      src={i.image}
                      alt={i.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 240px"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 0.6 }}>
                      No image
                    </div>
                  )}
                </div>
              </Link>

              <div style={{ padding: 12, display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 800, lineHeight: 1.2 }}>{i.name}</div>
                <div style={{ opacity: 0.85 }}>{money(i.price)}</div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/item/${i.id}`} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)" }}>
                    View
                  </Link>
                  <BuyNowButton itemId={i.id} price={i.price} status={i.status} disabled={(i.status ?? "available") !== "available"} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
