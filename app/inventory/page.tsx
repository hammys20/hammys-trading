"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listInventoryPublic } from "@/lib/data/inventory";

type Item = {
  id: string;
  name: string;
  price?: number;
  image?: string;
  status?: string;
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let cancelled = false;

    listInventoryPublic()
      .then((res) => {
        if (cancelled) return;

        // ✅ IMPORTANT FIX
        setItems(Array.isArray(res.data) ? (res.data as Item[]) : []);
      })
      .catch((err) => {
        console.error("Inventory load failed", err);
        setItems([]);
      })
      .finally(() => setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (statusFilter && (i.status ?? "") !== statusFilter) return false;
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  if (loading) return <div>Loading inventory…</div>;

  return (
    <div>
      <h1>Inventory</h1>

      {filtered.length === 0 && <p>No items found.</p>}

      <ul>
        {filtered.map((item) => (
          <li key={item.id}>
            <Link href={`/item/${item.id}`}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
