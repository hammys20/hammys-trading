"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listInventoryAdmin,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  type Item,
} from "@/lib/data/inventory";

import ImageUpload from "@.components/ImageUpload";

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
};

export default function AdminInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Partial<Item>>(EMPTY);

  async function refresh() {
    const res = await listInventoryAdmin();
    setItems(Array.isArray(res) ? res : []);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  async function onCreate() {
    if (!draft.name?.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createInventoryItem({
        name: draft.name.trim(),
        price: draft.price,
        status: draft.status ?? "available",
        image: draft.image || undefined,
        description: draft.description || undefined,
        tags: draft.tags ?? [],
      });

      setDraft(EMPTY);
      await refresh();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete item?")) return;
    await deleteInventoryItem(id);
    await refresh();
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin Inventory</h1>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
      )}

      {/* CREATE FORM */}
      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        <input
          placeholder="Name *"
          value={draft.name ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        />

        <input
          placeholder="Price"
          type="number"
          value={draft.price ?? ""}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              price: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />

        {/* 🔑 IMAGE UPLOAD */}
        <ImageUpload
          value={draft.image}
          onUploaded={(url) =>
            setDraft((d) => ({
              ...d,
              image: url,
            }))
          }
        />

        {draft.image && (
          <img
            src={draft.image}
            alt="Preview"
            style={{ width: 120, borderRadius: 8 }}
          />
        )}

        <textarea
          placeholder="Description"
          value={draft.description ?? ""}
          onChange={(e) =>
            setDraft((d) => ({ ...d, description: e.target.value }))
          }
        />

        <button onClick={onCreate} disabled={saving}>
          {saving ? "Saving…" : "Add Item"}
        </button>
      </div>

      {/* LIST */}
      <input
        placeholder="Search…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      {filtered.map((i) => (
        <div
          key={i.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 12,
            border: "1px solid #333",
            borderRadius: 10,
            marginBottom: 8,
          }}
        >
          <div>
            <strong>{i.name}</strong>
            <div>{money(i.price)}</div>
          </div>

          <button onClick={() => onDelete(i.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
