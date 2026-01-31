"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getUrl } from "aws-amplify/storage";
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
  const [gradingFilter, setGradingFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [error, setError] = useState("");

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
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

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

  useEffect(() => {
    let cancelled = false;

    async function loadImageUrls() {
      const missing = items.filter((i) => i.image && !imageUrls[i.id]);
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

      if (cancelled) return;
      setImageUrls((prev) => {
        const next = { ...prev };
        for (const [id, url] of entries) {
          if (url) next[id] = url;
        }
        return next;
      });
    }

    loadImageUrls();
    return () => {
      cancelled = true;
    };
  }, [items, imageUrls]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const status = (i.status ?? "available").toLowerCase();
      if (statusFilter && status !== statusFilter) return false;
      if (gradingFilter && (i.gradingCompany ?? "") !== gradingFilter) return false;
      if (gradeFilter && (i.grade ?? "") !== gradeFilter) return false;
      if (languageFilter && (i.language ?? "") !== languageFilter) return false;
      if (q) {
        const hay = [
          i.name,
          i.set,
          i.condition,
          i.gradingCompany,
          i.grade,
          i.language,
          ...(i.tags ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, statusFilter, gradingFilter, gradeFilter, languageFilter]);

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

        <select value={gradingFilter} onChange={(e) => setGradingFilter(e.target.value)} style={{ padding: 10 }}>
          {gradingOptions.map((g) => (
            <option key={g || "all"} value={g}>
              {g || "All graders"}
            </option>
          ))}
        </select>

        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} style={{ padding: 10 }}>
          {gradeOptions.map((g) => (
            <option key={g || "all"} value={g}>
              {g || "All grades"}
            </option>
          ))}
        </select>

        <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} style={{ padding: 10 }}>
          {languageOptions.map((l) => (
            <option key={l || "all"} value={l}>
              {l || "All languages"}
            </option>
          ))}
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
                  {imageUrls[i.id] ? (
                    <Image
                      src={imageUrls[i.id]}
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
                {i.set ? <div style={{ opacity: 0.85 }}>{i.set}</div> : null}
                <div style={{ opacity: 0.75 }}>
                  {[i.condition, i.gradingCompany, i.grade, i.language]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
                <div style={{ opacity: 0.85 }}>{money(i.price)}</div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/item/${i.id}`} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)" }}>
                    View
                  </Link>
                  <BuyNowButton itemId={i.id} price={i.price} status={i.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
