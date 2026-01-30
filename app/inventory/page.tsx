"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";

function money(n?: number) {
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

    listInventoryPublic()
      .then((arr) => {
        if (!cancelled) setItems(Array.isArray(arr) ? arr : []);
      })
      .catch((err) => {
        console.error("Public inventory load failed:", err);
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
    const q = search.trim().toLowerCase();
    const s = statusFilter.trim().toLowerCase();

    return items.filter((i) => {
      if (s && (i.status ?? "").toLowerCase() !== s) return false;
      if (q && !i.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  if (loading) return <div style={{ padding: 24 }}>Loading inventory…</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Inventory</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          style={{ padding: 10, width: 320 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: 10 }}
        >
          <option value="">All statuses</option>
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
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/item/${item.id}`}
              style={{ border: "1px solid rgba(255,255,255,0.12)", padding: 12, borderRadius: 12 }}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={400}
                  height={400}
                  style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 10 }}
                />
              ) : (
                <div style={{ height: 220, borderRadius: 10, border: "1px dashed rgba(255,255,255,0.15)" }} />
              )}

              <div style={{ marginTop: 10, fontWeight: 650 }}>{item.name}</div>
              <div style={{ opacity: 0.85 }}>{money(item.price)}</div>
              <div style={{ opacity: 0.65, fontSize: 12, marginTop: 4 }}>{item.status ?? "—"}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { listInventoryPublic } from "@/lib/data/inventory";

// type Item = {
//   id: string;
//   name: string;
//   price?: number;
//   image?: string;
//   status?: string;
// };

// export default function InventoryPage() {
//   const [items, setItems] = useState<Item[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");

//   useEffect(() => {
//     let cancelled = false;

//     listInventoryPublic()
//       .then((res) => {
//         if (cancelled) return;

//         // ✅ IMPORTANT FIX
//         setItems(Array.isArray(res.data) ? (res.data as Item[]) : []);
//       })
//       .catch((err) => {
//         console.error("Inventory load failed", err);
//         setItems([]);
//       })
//       .finally(() => setLoading(false));

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const filtered = useMemo(() => {
//     return items.filter((i) => {
//       if (statusFilter && (i.status ?? "") !== statusFilter) return false;
//       if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
//       return true;
//     });
//   }, [items, search, statusFilter]);

//   if (loading) return <div>Loading inventory…</div>;

//   return (
//     <div>
//       <h1>Inventory</h1>

//       {filtered.length === 0 && <p>No items found.</p>}

//       <ul>
//         {filtered.map((item) => (
//           <li key={item.id}>
//             <Link href={`/item/${item.id}`}>{item.name}</Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
