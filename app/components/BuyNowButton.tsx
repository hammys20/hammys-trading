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
  const isDisabled = !!disabled || loading;

  async function go() {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout failed");

      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message ?? "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={go}
      disabled={isDisabled}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.14)",
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Starting checkout…" : "Buy now"}
    </button>
  );
}
