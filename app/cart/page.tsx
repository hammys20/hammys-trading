"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getUrl } from "aws-amplify/storage";
import { ensureAmplifyConfigured } from "@/lib/amplify-client";
import { useCart } from "@/components/CartProvider";
import { listInventoryPublic, type Item } from "@/lib/data/inventory";

function money(n?: number) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function CartPage() {
  const { items, setQty, removeItem, clear } = useCart();
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    ensureAmplifyConfigured();
    let cancelled = false;

    (async () => {
      try {
        setError("");
        const data = await listInventoryPublic();
        if (!cancelled) setInventory(Array.isArray(data) ? data : []);
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

  const cartItems = useMemo(() => {
    const map = new Map(inventory.map((i) => [i.id, i]));
    return items
      .map((c) => {
        const item = map.get(c.id);
        return item ? { item, qty: c.qty } : null;
      })
      .filter(Boolean) as { item: Item; qty: number }[];
  }, [items, inventory]);

  useEffect(() => {
    let cancelled = false;

    async function loadImageUrls() {
      const missing = cartItems.filter((c) => c.item.image && !imageUrls[c.item.id]);
      if (missing.length === 0) return;

      const entries = await Promise.all(
        missing.map(async ({ item }) => {
          try {
            const res = await getUrl({ path: item.image as string });
            return [item.id, res.url.toString()] as const;
          } catch {
            return [item.id, ""] as const;
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
  }, [cartItems, imageUrls]);

  const total = cartItems.reduce((sum, c) => sum + (c.item.price ?? 0) * c.qty, 0);

  async function checkout() {
    if (cartItems.length === 0) return;
    setCheckingOut(true);
    try {
      const payload = cartItems.map((c) => ({ id: c.item.id, qty: c.qty }));
      const res = await fetch("/api/stripe/checkout-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const msg = json?.error || `Checkout failed (${res.status})`;
        throw new Error(msg);
      }
      if (!json?.url) throw new Error("No checkout URL returned.");
      window.location.href = json.url;
    } catch (e: any) {
      alert(e?.message ?? "Checkout failed.");
      console.error(e);
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading cart…</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Your Cart</h1>

      {error ? (
        <div style={{ padding: 12, border: "1px solid rgba(255,80,80,0.4)", borderRadius: 10, marginBottom: 14 }}>
          {error}
        </div>
      ) : null}

      {cartItems.length === 0 ? (
        <div>
          <div style={{ marginBottom: 12 }}>Your cart is empty.</div>
          <Link href="/inventory" className="btn btnPrimary">
            Browse Inventory
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {cartItems.map(({ item, qty }) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ position: "relative", width: 72, height: 72 }}>
                {imageUrls[item.id] ? (
                  <Image
                    src={imageUrls[item.id]}
                    alt={item.name}
                    fill
                    sizes="72px"
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: 8, background: "rgba(255,255,255,0.04)" }} />
                )}
              </div>

              <div>
                <div style={{ fontWeight: 800 }}>{item.name}</div>
                <div style={{ opacity: 0.8 }}>{money(item.price)}</div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select
                  value={qty}
                  onChange={(e) => setQty(item.id, Number(e.target.value))}
                  style={{ padding: 8 }}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.92)",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <button
              onClick={clear}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.92)",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Clear Cart
            </button>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 800 }}>Total: {money(total)}</div>
              <button
                onClick={checkout}
                disabled={checkingOut}
                className="btn btnPrimary"
                style={{ opacity: checkingOut ? 0.7 : 1 }}
              >
                {checkingOut ? "Redirecting…" : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
