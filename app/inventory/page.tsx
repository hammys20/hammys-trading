"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { listInventoryPublic } from "@/lib/data/inventory";

type Item = {
  id: string;
  name: string;
  price?: number;
  status?: string;
  image?: string;
  description?: string;
};

const STATUSES = ["available", "pending", "sold"] as const;

function money(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // ✅ FIXED: normalize Amplify response → array
  useEffect(() => {
    let cancelled = false;

    listInventoryPublic()
      .then((res: any) => {
        const arr = (res?.data ?? []) as Item[];
        if (!cancelled) setItems(arr);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ FIXED: defensive filter + lowercase status matching
  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (statusFilter) {
        const a = (i.status ?? "").toLowerCase();
        const b = statusFilter.toLowerCase();
        if (a !== b) return false;
      }

      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [items, search, statusFilter]);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading inventory…</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1>Inventory</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && <div>No items found.</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((item) => (
          <Link key={item.id} href={`/item/${item.id}`}>
            <div style={{ border: "1px solid #ddd", padding: 12 }}>
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={220}
                  height={220}
                />
              )}
              <h3>{item.name}</h3>
              <div>{money(item.price)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
