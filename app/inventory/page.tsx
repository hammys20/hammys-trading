"use client";

import { useEffect, useMemo, useState } from "react";
import { getUrl } from "aws-amplify/storage";
import { ensureAmplifyConfigured } from "@/lib/amplify-client";
import BuyNowButton from "@/components/BuyNowButton";
import AddToCartButton from "@/components/AddToCartButton";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";
import ImageCarousel from "@/components/ImageCarousel";

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
  const [imageModal, setImageModal] = useState<{
    urls: string[];
    alt: string;
    index: number;
  } | null>(null);

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
  const [imageUrls, setImageUrls] = useState<Record<string, string[]>>({});

  useEffect(() => {
    ensureAmplifyConfigured();
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
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setImageModal(null);
    }
    if (imageModal) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [imageModal]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function loadImageUrls(attempt = 0) {
      const missing = items.filter((i) => {
        const keys = Array.isArray(i.images) && i.images.length > 0 ? i.images : i.image ? [i.image] : [];
        return keys.length > 0 && !imageUrls[i.id];
      });
      if (missing.length === 0) return;

      const entries = await Promise.all(
        missing.map(async (i) => {
          const keys = Array.isArray(i.images) && i.images.length > 0 ? i.images : i.image ? [i.image] : [];
          try {
            const urls = await Promise.all(
              keys.map(async (k) => {
                const res = await getUrl({ path: k as string, options: { expiresIn: 3600 } });
                return res.url.toString();
              })
            );
            return [i.id, urls] as const;
          } catch {
            return [i.id, []] as const;
          }
        })
      );

      if (cancelled) return;
      const next: Record<string, string[]> = { ...imageUrls };
      for (const [id, urls] of entries) {
        if (urls.length > 0) next[id] = urls;
      }
      setImageUrls(next);

      const stillMissing = missing.some((i) => !next[i.id] || next[i.id].length === 0);
      if (stillMissing && attempt < 2) {
        retryTimer = setTimeout(() => loadImageUrls(attempt + 1), 800);
      }
    }

    loadImageUrls();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
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
              <button
                type="button"
                onClick={() => {
                  const urls = imageUrls[i.id];
                  if (urls?.length) setImageModal({ urls, alt: i.name ?? "Item image", index: 0 });
                }}
                style={{
                  display: "block",
                  padding: 0,
                  border: 0,
                  background: "transparent",
                  textAlign: "left",
                  cursor: imageUrls[i.id]?.length ? "zoom-in" : "default",
                }}
                aria-label={`View ${i.name ?? "item"} image`}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  {imageUrls[i.id]?.length ? (
                    <img
                      src={imageUrls[i.id][0]}
                      alt={i.name}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter:
                          (i.status ?? "available") === "sold"
                            ? "grayscale(0.6) brightness(0.7)"
                            : "none",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        opacity: 0.6,
                      }}
                    >
                      No image
                    </div>
                  )}
                  {(i.status ?? "available") === "sold" ? (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(0,0,0,0.45)",
                        color: "rgba(255,255,255,0.95)",
                        fontWeight: 900,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      Sold
                    </div>
                  ) : null}
                </div>
              </button>

              <div style={{ padding: 12, display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 800, lineHeight: 1.2 }}>{i.name}</div>
                {i.set ? <div style={{ opacity: 0.85 }}>{i.set}</div> : null}
                <div style={{ opacity: 0.75 }}>
                  {[i.condition, i.gradingCompany, i.grade, i.language]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
                <div style={{ opacity: 0.85 }}>{money(i.price)}</div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      const urls = imageUrls[i.id];
                      if (urls?.length) setImageModal({ urls, alt: i.name ?? "Item image", index: 0 });
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "rgba(255,255,255,0.04)",
                      fontWeight: 700,
                      color: "inherit",
                      cursor: imageUrls[i.id]?.length ? "zoom-in" : "not-allowed",
                      opacity: imageUrls[i.id]?.length ? 1 : 0.6,
                    }}
                    disabled={!imageUrls[i.id]?.length}
                  >
                    View
                  </button>
                  <AddToCartButton
                    itemId={i.id}
                    disabled={(i.status ?? "available") !== "available"}
                  />
                  <BuyNowButton itemId={i.id} price={i.price} status={i.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {imageModal ? (
        <div
          onClick={() => setImageModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(96vw, 900px)",
              maxHeight: "min(90vh, 900px)",
              width: "100%",
              background: "rgba(10,10,12,0.9)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 16,
              padding: 12,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setImageModal(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "inherit",
                  cursor: "pointer",
                }}
                aria-label="Close image"
              >
                ✕
              </button>
            </div>
            <ImageCarousel
              images={imageModal.urls.map((src) => ({ src, alt: imageModal.alt }))}
              initialIndex={imageModal.index}
              allowOpenInNewTab
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
