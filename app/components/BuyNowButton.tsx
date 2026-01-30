"use client";

import { useState } from "react";

export default function BuyNowButton({
  itemId,
  price,
  status,
  disabled,
}: {
  itemId: string;
  price?: number;
  status?: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const isSold = (status ?? "").toLowerCase() === "sold";
  const isDisabled = Boolean(disabled) || loading || isSold || !price || price <= 0;

  async function onClick() {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Checkout failed");
      }

      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert("Internal Server Error — check server logs for /api/stripe/checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.14)",
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Redirecting…" : isSold ? "Sold" : "Buy Now"}
    </button>
  );
}
