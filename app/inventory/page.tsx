"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BuyNowButton from "@/components/BuyNowButton";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";

function money(n?: number | null) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const arr = await listInventoryPublic();
        if (!cancelled) setItems(Array.isArray(arr) ? arr : []);
      } catch (e) {
        console.error("Inventory load failed", e);
        if (!cancelled) setItems([]);
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
      if (statusFilter && (i.status ?? "") !== statusFilter) return false;
      if (q && !(i.name ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  if (loading) return <div style={{ padding: 24 }}>Loading inventory…</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Inventory</h1>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)" }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)" }}
          >
            <option value="">all</option>
            <option value="available">available</option>
            <option value="pending">pending</option>
            <option value="sold">sold</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ opacity: 0.85 }}>No items found.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((i) => {
            const canBuy = (i.status ?? "available") === "available";
            return (
              <div
                key={i.id}
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  overflow: "hidden",
                }}
              >
                <Link href={`/item/${i.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                  <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3", background: "rgba(0,0,0,0.25)" }}>
                    {i.image ? (
                      <Image
                        src={i.image}
                        alt={i.name}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 0.65 }}>
                        No image
                      </div>
                    )}
                  </div>

                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 850, marginBottom: 6, lineHeight: 1.15 }}>{i.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, opacity: 0.9 }}>
                      <span>{money(i.price)}</span>
                      <span style={{ opacity: 0.75 }}>{i.status ?? "—"}</span>
                    </div>
                  </div>
                </Link>

                <div style={{ padding: 12, paddingTop: 0, display: "flex", gap: 10, alignItems: "center" }}>
                  <BuyNowButton itemId={i.id} disabled={!canBuy} />
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    {canBuy ? "Ready" : "Not for sale"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
