"use client";

import { useEffect, useMemo, useState } from "react";
import { getUrl } from "aws-amplify/storage";
import { ensureAmplifyConfigured } from "@/lib/amplify-client";
import {
  listInventoryAdmin,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  type Item,
} from "@/lib/data/inventory";

import ImageUpload from "@/components/ImageUpload";


function money(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function csvEscape(value: string) {
  if (value.includes("\"") || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

function toCsvRow(values: string[]) {
  return values.map(csvEscape).join(",");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let cur = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === "\"" && next === "\"") {
      cur += "\"";
      i += 1;
      continue;
    }

    if (ch === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cur);
      cur = "";
      if (row.some((v) => v.trim().length > 0)) rows.push(row);
      row = [];
      continue;
    }

    cur += ch;
  }

  row.push(cur);
  if (row.some((v) => v.trim().length > 0)) rows.push(row);
  return rows;
}

const EMPTY: Partial<Item> = {
  name: "",
  set: "",
  condition: "",
  certificationNumber: "",
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
  const [editingId, setEditingId] = useState<string | null>(null);
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
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function loadPreviews(attempt = 0) {
      const missing = items.filter((i) => i.image && !itemPreviews[i.id]);
      if (missing.length === 0) return;

      const entries = await Promise.all(
        missing.map(async (i) => {
          try {
            const res = await getUrl({ path: i.image as string, options: { expiresIn: 3600 } });
            return [i.id, res.url.toString()] as const;
          } catch {
            return [i.id, ""] as const;
          }
        })
      );

      if (cancelled) return;
      const next: Record<string, string> = { ...itemPreviews };
      for (const [id, url] of entries) {
        if (url) next[id] = url;
      }
      setItemPreviews(next);

      const stillMissing = missing.some((i) => !next[i.id]);
      if (stillMissing && attempt < 2) {
        retryTimer = setTimeout(() => loadPreviews(attempt + 1), 800);
      }
    }

    loadPreviews();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [items, itemPreviews]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => {
      const hay = [
        i.name,
        i.set,
        i.condition,
        i.certificationNumber,
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

  async function onCreateOrUpdate() {
    if (!draft.name?.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await updateInventoryItem({
          id: editingId,
          name: draft.name.trim(),
          set: draft.set || undefined,
          condition: draft.condition || undefined,
          certificationNumber: draft.certificationNumber || undefined,
          gradingCompany: draft.gradingCompany || undefined,
          grade: draft.grade || undefined,
          language: draft.language || undefined,
          price: draft.price,
          status: draft.status ?? "available",
          image: draft.image || undefined,
          tags: draft.tags ?? [],
        });
      } else {
        await createInventoryItem({
          id: draftId,
          name: draft.name.trim(),
          set: draft.set || undefined,
          condition: draft.condition || undefined,
          certificationNumber: draft.certificationNumber || undefined,
          gradingCompany: draft.gradingCompany || undefined,
          grade: draft.grade || undefined,
          language: draft.language || undefined,
          price: draft.price,
          status: draft.status ?? "available",
          image: draft.image || undefined,
          tags: draft.tags ?? [],
        });
      }

      setDraft(EMPTY);
      setEditingId(null);
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

  function exportCsv() {
    const header = [
      "name",
      "set",
      "condition",
      "certificationNumber",
      "gradingCompany",
      "grade",
      "language",
      "price",
      "status",
      "image",
      "tags",
    ];

    const rows = filtered.map((i) =>
      toCsvRow([
        i.name ?? "",
        i.set ?? "",
        i.condition ?? "",
        i.certificationNumber ?? "",
        i.gradingCompany ?? "",
        i.grade ?? "",
        i.language ?? "",
        i.price != null ? String(i.price) : "",
        i.status ?? "",
        i.image ?? "",
        Array.isArray(i.tags) ? i.tags.join("|") : "",
      ])
    );

    const csv = [toCsvRow(header), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) return;

    const header = rows[0].map((h) => h.trim());
    const idx = (key: string) => header.findIndex((h) => h === key);

    const iName = idx("name");
    if (iName === -1) {
      setError("CSV must include a 'name' column");
      return;
    }

    const toTags = (raw: string) =>
      raw
        .split("|")
        .map((t) => t.trim())
        .filter(Boolean);

    setSaving(true);
    setError("");

    try {
      for (let r = 1; r < rows.length; r += 1) {
        const row = rows[r];
        const name = row[iName]?.trim();
        if (!name) continue;

        const get = (key: string) => {
          const i = idx(key);
          return i >= 0 ? row[i]?.trim() ?? "" : "";
        };

        const priceRaw = get("price");
        const price = priceRaw ? Number(priceRaw) : undefined;

        await createInventoryItem({
          name,
          set: get("set") || undefined,
          condition: get("condition") || undefined,
          certificationNumber: get("certificationNumber") || undefined,
          gradingCompany: get("gradingCompany") || undefined,
          grade: get("grade") || undefined,
          language: get("language") || undefined,
          price: Number.isFinite(price as number) ? price : undefined,
          status: get("status") || "available",
          image: get("image") || undefined,
          tags: toTags(get("tags")),
        });
      }

      await refresh();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "CSV import failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete item?")) return;
    await deleteInventoryItem(id);
    await refresh();
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setDraft({
      name: item.name ?? "",
      set: item.set ?? "",
      condition: item.condition ?? "",
      certificationNumber: item.certificationNumber ?? "",
      gradingCompany: item.gradingCompany ?? "",
      grade: item.grade ?? "",
      language: item.language ?? "",
      price: item.price,
      status: item.status ?? "available",
      image: item.image ?? "",
      tags: item.tags ?? [],
    });
    setTagsText(Array.isArray(item.tags) ? item.tags.join(", ") : "");
    setImagePreview(itemPreviews[item.id] ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY);
    setDraftId(crypto.randomUUID());
    setImagePreview("");
    setTagsText("");
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Admin Inventory</h1>
          <div style={{ opacity: 0.7, marginTop: 4 }}>Create and manage your listings</div>
        </div>
        <div style={{ opacity: 0.7, fontSize: 12 }}>{items.length} items</div>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
      )}

      {/* CREATE FORM */}
      <div
        style={{
          display: "grid",
          gap: 16,
          marginBottom: 24,
          padding: 16,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>
            {editingId ? "Edit Listing" : "New Listing"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={exportCsv}
              style={{ padding: "8px 10px", borderRadius: 10, fontWeight: 700 }}
            >
              Export CSV
            </button>
            <label
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Import CSV
              <input
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void importCsv(file);
                }}
              />
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
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
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <input
            list="pokemon-sets"
            placeholder="Set"
            value={draft.set ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, set: e.target.value }))}
          />
          <select
            value={draft.status ?? "available"}
            onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
          >
            <option value="available">available</option>
            <option value="pending">pending</option>
            <option value="sold">sold</option>
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
        </div>
        <datalist id="pokemon-sets">
          {setOptions.map((s) => (
            <option key={s.id} value={s.name} />
          ))}
        </datalist>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <input
            placeholder="Condition"
            value={draft.condition ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, condition: e.target.value }))}
          />
          <input
            placeholder="Certification #"
            value={draft.certificationNumber ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, certificationNumber: e.target.value }))
            }
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
        </div>

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

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
              />
            ) : (
              <div style={{ opacity: 0.6, fontSize: 12 }}>No preview yet</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {editingId ? (
              <button
                onClick={cancelEdit}
                disabled={saving}
                style={{ padding: "10px 14px", fontWeight: 700 }}
              >
                Cancel
              </button>
            ) : null}
            <button
              onClick={onCreateOrUpdate}
              disabled={saving}
              style={{ padding: "10px 14px", fontWeight: 800 }}
            >
              {saving ? "Saving…" : editingId ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      {filtered.map((i) => (
        <div
          key={i.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 12,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 10,
            marginBottom: 8,
            background: "rgba(255,255,255,0.02)",
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
              {i.certificationNumber ? (
                <div style={{ opacity: 0.7, fontSize: 12 }}>
                  Cert #: {i.certificationNumber}
                </div>
              ) : null}
              <div>{money(i.price)}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => startEdit(i)}>Edit</button>
            <button onClick={() => onDelete(i.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
