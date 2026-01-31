"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

export default function AddToCartButton(props: {
  itemId: string;
  disabled?: boolean;
}) {
  const { itemId, disabled } = props;
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const isDisabled = Boolean(disabled) || adding;

  function onClick() {
    if (isDisabled) return;
    setAdding(true);
    addItem(itemId, 1);
    setTimeout(() => setAdding(false), 250);
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.16)",
        background: isDisabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
        color: "rgba(255,255,255,0.95)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontWeight: 700,
        letterSpacing: 0.2,
      }}
      title={disabled ? "Unavailable" : "Add to cart"}
    >
      {adding ? "Added" : "Add to Cart"}
    </button>
  );
}
