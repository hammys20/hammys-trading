"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listInventoryAdmin,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  type Item,
} from "@/lib/data/inventory";

function money(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const EMPTY: Partial<Item> = {
  name: "",
  price: undefined,
  status: "available",
  image: "",
  description: "",
  tags: [],
  set: "",
  number: "",
  condition: "",
};

export default function AdminInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Partial<Item>>(EMPTY);

  async function refresh() {
    setError("");
    try {
      const arr = await listInventoryAdmin();
      setItems(Array.isArray(arr) ? arr : []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to load admin inventory.");
      setItems([]);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await refresh();
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
    if (!q) return items;
    return items.filter((i) => (i.name ?? "").toLowerCase().includes(q));
  }, [items, search]);

  async function onCreate() {
    setError("");
    const name = (draft.name ?? "").trim();
    if (!name) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      await createInventoryItem({
        name,
        price: typeof draft.price === "number" ? draft.price : undefined,
        status: (draft.status ?? "available") as string,
        image: (draft.image ?? "").trim() || undefined,
        description: (draft.description ?? "").trim() || undefined,
        tags: Array.isArray(draft.tags) ? draft.tags : [],
        set: (draft.set ?? "").trim() || undefined,
        number: (draft.number ?? "").trim() || undefined,
        condition: (draft.condition ?? "").trim() || undefined,
      });

      setDraft(EMPTY);
      await refresh();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Create failed. Are you in the Admin group?");
    } finally {
      setSaving(false);
    }
  }

  async function onQuickStatus(id: string, status: string) {
    setError("");
    setSaving(true);
    try {
      await updateInventoryItem({ id, status });
      setItems((cur) => cur.map((x) => (x.id === id ? { ...x, status } : x)));
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this item?")) return;
    setError("");
    setSaving(true);
    try {
      await deleteInventoryItem(id);
      setItems((cur) => cur.filter((x) => x.id !== id));
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Delete failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading admin inventory…</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Admin Inventory</h1>

      {error ? (
        <div
          style={{
            padding: 12,
            border: "1px solid rgba(255,80,80,0.4)",
            borderRadius: 10,
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Name *"
          value={draft.name ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          style={{ padding: 10 }}
        />

        <input
          placeholder="Price"
          value={typeof draft.price === "number" ? String(draft.price) : ""}
          onChange={(e) => {
            const v = e.target.value.trim();
            setDraft((d) => ({ ...d, price: v ? Number(v) : undefined }));
          }}
          style={{ padding: 10 }}
        />

        <select
          value={(draft.status ?? "available") as string}
          onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
          style={{ padding: 10 }}
        >
          <option value="available">available</option>
          <option value="pending">pending</option>
          <option value="sold">sold</option>
        </select>

        <input
          placeholder="Image URL"
          value={draft.image ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
          style={{ padding: 10 }}
        />

        <input
          placeholder="Tags (comma separated)"
          value={Array.isArray(draft.tags) ? draft.tags.join(", ") : ""}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              tags: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            }))
          }
          style={{ padding: 10, gridColumn: "1 / -1" }}
        />

        <textarea
          placeholder="Description"
          value={draft.description ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          style={{ padding: 10, gridColumn: "1 / -1", minHeight: 80 }}
        />

        <button onClick={onCreate} disabled={saving} style={{ padding: 12, gridColumn: "1 / -1" }}>
          {saving ? "Saving…" : "Add Item"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <input
          placeholder="Search existing items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 10, width: 360 }}
        />
        <button onClick={refresh} disabled={saving} style={{ padding: 10 }}>
          Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <div>No items.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {filtered.map((i) => (
            <div
              key={i.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 10,
                padding: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 750 }}>{i.name}</div>
                <div style={{ opacity: 0.85 }}>
                  {money(i.price)} · {i.status ?? "—"}
                </div>
                <div style={{ opacity: 0.6, fontSize: 12 }}>{i.id}</div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button disabled={saving} onClick={() => onQuickStatus(i.id, "available")}>available</button>
                <button disabled={saving} onClick={() => onQuickStatus(i.id, "pending")}>pending</button>
                <button disabled={saving} onClick={() => onQuickStatus(i.id, "sold")}>sold</button>
                <button disabled={saving} onClick={() => onDelete(i.id)} style={{ opacity: 0.9 }}>
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
