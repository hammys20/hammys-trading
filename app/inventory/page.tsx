"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    listInventoryPublic()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        console.error("Inventory load failed", err);
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (statusFilter && (i.status ?? "") !== statusFilter) return false;
      if (search && !i.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [items, search, statusFilter]);

  if (loading) return <div style={{ padding: 24 }}>Loading inventory…</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1>Inventory</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={`/item/${item.id}`}
            style={{ textDecoration: "none" }}
          >
            <div style={{ border: "1px solid #333", padding: 12 }}>
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={300}
                  height={300}
                  style={{ width: "100%", height: "auto" }}
                />
              )}
              <div>{item.name}</div>
              <div>${item.price ?? "—"}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
