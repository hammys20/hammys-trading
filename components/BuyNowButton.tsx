"use client";

import { useState } from "react";

export default function BuyNowButton({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false);

  async function onBuy() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout failed");

      window.location.href = data.url;
    } catch (err: any) {
      alert(err?.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onBuy}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.08)",
        color: "white",
        fontWeight: 800,
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Redirecting…" : "Buy Now"}
    </button>
  );
}
