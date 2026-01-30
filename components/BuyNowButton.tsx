"use client";

import { useState } from "react";

export default function BuyNowButton({
  itemId,
  disabled,
}: {
  itemId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const isDisabled = disabled || loading;

  async function onClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Checkout failed");
      }

      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message ?? "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.14)",
        background: isDisabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.10)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontWeight: 800,
      }}
    >
      {loading ? "Opening checkout…" : disabled ? "Not available" : "Buy Now"}
    </button>
  );
}
