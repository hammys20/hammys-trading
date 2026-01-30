// components/BuyNowButton.tsx
"use client";

import { useState } from "react";

export default function BuyNowButton({
  itemId,
  price,
  status,
}: {
  itemId: string;
  price?: number;
  status?: string;
}) {
  const [loading, setLoading] = useState(false);
  const disabled = loading || !price || price <= 0 || (status ?? "available") !== "available";

  async function go() {
    if (disabled) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body?.error ?? `Checkout failed (${res.status})`);
      }
      if (!body?.url) throw new Error("Missing checkout URL from server.");

      window.location.href = body.url;
    } catch (e: any) {
      alert(e?.message ?? "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={go}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: disabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
        color: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 750,
      }}
      title={
        !price || price <= 0
          ? "Missing price"
          : (status ?? "available") !== "available"
            ? "Not available"
            : "Buy now"
      }
    >
      {loading ? "Redirecting…" : "Buy now"}
    </button>
  );
}
