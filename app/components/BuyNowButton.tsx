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
  const hasPrice = typeof price === "number" && price > 0;

  const isDisabled = Boolean(disabled) || !isAvailable || !hasPrice || loading;

  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
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
        throw new Error(json?.error || `Checkout failed (${res.status})`);
      }

      if (!json?.url) throw new Error("No checkout URL returned.");

      window.location.assign(json.url);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.14)",
        background: isDisabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.10)",
        color: "rgba(255,255,255,0.92)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontWeight: 700,
      }}
      title={
        !hasPrice ? "Missing price" : !isAvailable ? `Item is ${status}` : "Buy now"
      }
    >
      {loading ? "Redirecting…" : "Buy Now"}
    </button>
  );
}
