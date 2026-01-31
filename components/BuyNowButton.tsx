"use client";

import { useState } from "react";

export default function BuyNowButton(props: {
  itemId: string;
  price?: number;
  status?: string;
  disabled?: boolean;
}) {
  const { itemId, price, status, disabled } = props;
  const [loading, setLoading] = useState(false);

  const isAvailable = (status ?? "available") === "available";
  const priceNum = typeof price === "number" ? price : Number(price);
  const hasPrice = Number.isFinite(priceNum) && priceNum > 0;

  const isDisabled = Boolean(disabled) || !isAvailable || !hasPrice || loading;

  async function onClick() {
    if (isDisabled) return;
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
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
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(201,162,77,0.55)",
        background: isDisabled
          ? "rgba(201,162,77,0.12)"
          : "linear-gradient(180deg, rgba(201,162,77,0.28), rgba(201,162,77,0.12))",
        color: "var(--accent)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontWeight: 800,
        letterSpacing: 0.2,
      }}
      title={
        !hasPrice
          ? "Missing price"
          : !isAvailable
            ? `Item is ${status}`
            : "Buy now"
      }
    >
      {loading ? "Redirecting…" : "Buy Now"}
    </button>
  );
}
