"use client";

import { useEffect, useMemo, useState } from "react";
import { getUrl } from "aws-amplify/storage";
import { ensureAmplifyConfigured } from "@/lib/amplify-client";
import {
  listInventoryAdmin,
  createInventoryItem,
  deleteInventoryItem,
  type Item,
} from "@/lib/data/inventory";

import ImageUpload from "@/components/ImageUpload";


function money(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const EMPTY: Partial<Item> = {
  name: "",
  set: "",
  condition: "",
  gradingCompany: "",
  grade: "",
  language: "",
  price: undefined,
  status: "available",
  image: "",
  tags: [],
};

export default function AdminInventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Partial<Item>>(EMPTY);
  const [draftId, setDraftId] = useState(() => crypto.randomUUID());
  const [imagePreview, setImagePreview] = useState("");
  const [setOptions, setSetOptions] = useState<{ id: string; name: string }[]>([]);
  const [tagsText, setTagsText] = useState("");
  const [itemPreviews, setItemPreviews] = useState<Record<string, string>>({});

  const gradingOptions = ["", "PSA", "CGC", "BGS"];
  const gradeOptions = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const languageOptions = [
    "",
    "English",
    "Japanese",
    "Korean",
    "Chinese",
    "French",
    "German",
    "Italian",
    "Spanish",
    "Portuguese",
    "Indonesian",
    "Thai",
  ];

  async function refresh() {
    const res = await listInventoryAdmin();
    setItems(Array.isArray(res) ? res : []);
  }

  useEffect(() => {
    ensureAmplifyConfigured();
    refresh().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSets() {
      try {
        const res = await fetch(
          "https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&select=id,name&pageSize=250"
        );
        if (!res.ok) return;
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        if (!cancelled) {
          setSetOptions(
            data
              .map((s: any) => ({ id: String(s.id ?? ""), name: String(s.name ?? "") }))
              .filter((s: { id: string; name: string }) => s.id && s.name)
          );
        }
      } catch (e) {
        console.error("Failed to load Pokemon sets", e);
      }
    }

    loadSets();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let canceled = false;

    async function loadPreviews() {
      const missing = items.filter((i) => i.image && !itemPreviews[i.id]);
      if (missing.length === 0) return;

      const entries = await Promise.all(
        missing.map(async (i) => {
          try {
            const res = await getUrl({ path: i.image as string });
            return [i.id, res.url.toString()] as const;
          } catch {
            return [i.id, ""] as const;
          }
        })
      );

      if (canceled) return;
      setItemPreviews((prev) => {
        const next = { ...prev };
        for (const [id, url] of entries) {
          if (url) next[id] = url;
        }
        return next;
      });
    }

    loadPreviews();
    return () => {
      canceled = true;
    };
  }, [items, itemPreviews]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => {
      const hay = [
        i.name,
        i.set,
        i.condition,
        i.gradingCompany,
        i.grade,
        i.language,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
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
        id: draftId,
        name: draft.name.trim(),
        set: draft.set || undefined,
        condition: draft.condition || undefined,
        gradingCompany: draft.gradingCompany || undefined,
        grade: draft.grade || undefined,
        language: draft.language || undefined,
        price: draft.price,
        status: draft.status ?? "available",
        image: draft.image || undefined,
        tags: draft.tags ?? [],
      });

      setDraft(EMPTY);
      setDraftId(crypto.randomUUID());
      setImagePreview("");
      setTagsText("");
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
          list="pokemon-sets"
          placeholder="Set"
          value={draft.set ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, set: e.target.value }))}
        />
        <datalist id="pokemon-sets">
          {setOptions.map((s) => (
            <option key={s.id} value={s.name} />
          ))}
        </datalist>

        <input
          placeholder="Condition"
          value={draft.condition ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, condition: e.target.value }))}
        />

        <select
          value={draft.gradingCompany ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, gradingCompany: e.target.value || undefined }))}
        >
          {gradingOptions.map((g) => (
            <option key={g || "none"} value={g}>
              {g || "Grading Company"}
            </option>
          ))}
        </select>

        <select
          value={draft.grade ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, grade: e.target.value || undefined }))}
        >
          {gradeOptions.map((g) => (
            <option key={g || "none"} value={g}>
              {g || "Grade"}
            </option>
          ))}
        </select>

        <select
          value={draft.language ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, language: e.target.value || undefined }))}
        >
          {languageOptions.map((l) => (
            <option key={l || "none"} value={l}>
              {l || "Language"}
            </option>
          ))}
        </select>

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

        <select
          value={draft.status ?? "available"}
          onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
        >
          <option value="available">available</option>
          <option value="pending">pending</option>
          <option value="sold">sold</option>
        </select>

        {/* 🔑 IMAGE UPLOAD */}
        <ImageUpload
          itemId={draftId}
          currentKey={draft.image}
          onUploaded={(key, previewUrl) => {
            setDraft((d) => ({
              ...d,
              image: key,
            }));
            setImagePreview(previewUrl);
          }}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: 120, borderRadius: 8 }}
          />
        )}

        <input
          placeholder="Tags (comma separated)"
          value={tagsText}
          onChange={(e) => {
            const next = e.target.value;
            setTagsText(next);
            const tags = next
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            setDraft((d) => ({ ...d, tags }));
          }}
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
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {itemPreviews[i.id] ? (
              <img
                src={itemPreviews[i.id]}
                alt={i.name}
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
              />
            ) : null}
            <div>
              <strong>{i.name}</strong>
              {i.set ? <div style={{ opacity: 0.8 }}>{i.set}</div> : null}
              <div style={{ opacity: 0.8 }}>
                {[i.condition, i.gradingCompany, i.grade, i.language]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </div>
              <div>{money(i.price)}</div>
            </div>
          </div>

          <button onClick={() => onDelete(i.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
