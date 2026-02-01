"use client";

import { useEffect, useMemo, useState } from "react";
import { ensureAmplifyConfigured } from "@/lib/amplify-client";
import { listOrdersAdmin, updateOrderAdmin } from "@/lib/data/orders";
import type { Order } from "@/lib/data/inventory";

const STATUS_OPTIONS = ["pending", "fulfilled", "canceled", "refunded"] as const;

function formatMoney(n?: number, currency?: string) {
  if (typeof n !== "number") return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  });
}

function parseItems(itemsJson?: string): { id: string; name: string; price: number | null }[] {
  if (!itemsJson) return [];
  try {
    const parsed = JSON.parse(itemsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    const res = await listOrdersAdmin();
    setOrders(Array.isArray(res) ? res : []);
  }

  useEffect(() => {
    ensureAmplifyConfigured();
    refresh()
      .catch((e) => setError(e?.message ?? "Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => {
      const da = new Date(a.createdAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? 0).getTime();
      return db - da;
    });
  }, [orders]);

  async function updateStatus(id: string, status: string) {
    setSavingId(id);
    try {
      await updateOrderAdmin({ id, status });
      await refresh();
    } catch (e: any) {
      alert(e?.message ?? "Update failed");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading orders…</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Orders & Shipping</h1>
          <div style={{ opacity: 0.7, marginTop: 4 }}>Track purchases and fulfillment</div>
        </div>
        <div style={{ opacity: 0.7, fontSize: 12 }}>{orders.length} orders</div>
      </div>

      {error ? <div style={{ color: "red", marginBottom: 12 }}>{error}</div> : null}

      {sorted.length === 0 ? (
        <div>No orders yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {sorted.map((o) => {
            const items = parseItems(o.itemsJson);
            return (
              <div
                key={o.id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.03)",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>
                      {o.buyerName || "Customer"}{" "}
                      <span style={{ opacity: 0.7, fontWeight: 600 }}>
                        {o.buyerEmail ? `• ${o.buyerEmail}` : ""}
                      </span>
                    </div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontWeight: 800 }}>{formatMoney(o.total, o.currency)}</div>
                    <select
                      value={(o.status ?? "pending").toLowerCase()}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      disabled={savingId === o.id}
                      style={{ padding: "8px 10px", borderRadius: 8 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontWeight: 700 }}>Shipping Address</div>
                  <div style={{ opacity: 0.85 }}>{o.shippingAddress || "Not provided"}</div>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontWeight: 700 }}>Items</div>
                  {items.length > 0 ? (
                    <div style={{ display: "grid", gap: 4 }}>
                      {items.map((it) => (
                        <div key={`${o.id}-${it.id}`} style={{ opacity: 0.9 }}>
                          {it.name} — {typeof it.price === "number" ? formatMoney(it.price, o.currency) : "—"}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ opacity: 0.7 }}>No items recorded.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
