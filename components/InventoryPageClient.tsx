"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { getUrl } from "aws-amplify/storage";
import { ensureAmplifyConfigured } from "@/lib/amplify-client";
import BuyNowButton from "@/components/BuyNowButton";
import AddToCartButton from "@/components/AddToCartButton";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";
import { useSearchParams } from "next/navigation";
import ImageCarousel from "@/components/ImageCarousel";

function money(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function InventoryContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("available");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [gradingFilter, setGradingFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [error, setError] = useState("");

  const gradingOptions = ["", "PSA", "CGC", "BGS"];
  const gradeOptions = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const categoryOptions = ["", "pokemon", "sports"];
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
    const category = searchParams?.get("category")?.toLowerCase() ?? "";
    if (category === "pokemon" || category === "sports") {
      setCategoryFilter(category);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function loadImageUrls(attempt = 0) {
      const missing = items.filter((i) => {
        const keys =
          Array.isArray(i.images) && i.images.length > 0
            ? i.images
            : i.image
              ? [i.image]
              : [];
        return keys.length > 0 && !imageUrls[i.id];
      });
      if (missing.length === 0) return;

      const entries: Array<[string, string[]]> = await Promise.all(
        missing.map(async (i) => {
          const keys =
            Array.isArray(i.images) && i.images.length > 0
              ? i.images
              : i.image
                ? [i.image]
                : [];
          try {
            const urls = await Promise.all(
              keys.map(async (k) => {
                const res = await getUrl({
                  path: k as string,
                  options: { expiresIn: 3600 },
                });
                return res.url.toString();
              })
            );
            return [i.id, [...urls]];
          } catch {
            return [i.id, [] as string[]];
          }
        })
      );

      if (cancelled) return;

      setImageUrls((prev) => {
        const next = { ...prev };
        for (const [id, urls] of entries) next[id] = urls;
        return next;
      });

      if (entries.length > 0 && attempt < 2) {
        retryTimer = setTimeout(() => loadImageUrls(attempt + 1), 700);
      }
    }

    loadImageUrls();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [items, imageUrls]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((i) => {
      if (statusFilter && i.status !== statusFilter) return false;
      if (categoryFilter && i.category?.toLowerCase() !== categoryFilter)
        return false;
      if (
        gradingFilter &&
        i.gradingCompany?.toLowerCase() !== gradingFilter.toLowerCase()
      )
        return false;
      if (gradeFilter && String(i.grade ?? "") !== gradeFilter) return false;
      if (languageFilter && i.language !== languageFilter) return false;
      if (!term) return true;
      const cardNumber = (i as { number?: string }).number;
      return (
        i.name?.toLowerCase().includes(term) ||
        i.set?.toLowerCase().includes(term) ||
        cardNumber?.toLowerCase().includes(term)
      );
    });
  }, [
    items,
    search,
    statusFilter,
    categoryFilter,
    gradingFilter,
    gradeFilter,
    languageFilter,
  ]);

  const availableCount = filtered.filter((i) => i.status === "available").length;

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ marginTop: 0 }}>Inventory</h1>
      <p style={{ opacity: 0.85 }}>
        Browse singles, slabs, and collector favorites. Use filters to narrow by
        category, grading, and condition.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <input
          className="input"
          placeholder="Search card name, set, or #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ gridColumn: "span 2" }}
        />
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="available">Available</option>
          <option value="">All Statuses</option>
          <option value="sold">Sold</option>
        </select>
        <select
          className="input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categoryOptions
            .filter(Boolean)
            .map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
        </select>
        <select
          className="input"
          value={gradingFilter}
          onChange={(e) => setGradingFilter(e.target.value)}
        >
          <option value="">All Graders</option>
          {gradingOptions
            .filter(Boolean)
            .map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
        </select>
        <select
          className="input"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
        >
          <option value="">All Grades</option>
          {gradeOptions
            .filter(Boolean)
            .map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
        </select>
        <select
          className="input"
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
        >
          <option value="">All Languages</option>
          {languageOptions
            .filter(Boolean)
            .map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
        </select>
      </div>

      <div style={{ marginBottom: 10, color: "var(--muted)" }}>
        {loading
          ? "Loading inventory…"
          : `${availableCount} available · ${filtered.length} total`}
      </div>

      {error ? (
        <div className="card" style={{ padding: 16 }}>
          {error}
        </div>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((item) => {
              const urls = imageUrls[item.id] ?? [];
              const price = money(item.price);
              return (
                <div key={item.id} className="card" style={{ padding: 14 }}>
                  <div
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.08)",
                      marginBottom: 12,
                    }}
                  >
                    <ImageCarousel
                      images={urls.map((src) => ({
                        src,
                        alt: item.name || "Trading card",
                      }))}
                      imageFit="contain"
                    />
                  </div>
                  <div style={{ fontWeight: 900 }}>{item.name}</div>
                  <div style={{ opacity: 0.75, fontSize: 13 }}>
                    {item.set} {item.number ? `#${item.number}` : ""}
                  </div>
                  <div style={{ marginTop: 6, fontWeight: 800 }}>{price}</div>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <AddToCartButton item={item} />
                    <BuyNowButton item={item} />
                  </div>
                </div>
              );
            })}
          </div>
        </Suspense>
      )}

    </main>
  );
}

export default function InventoryPageClient() {
  return <InventoryContent />;
}
