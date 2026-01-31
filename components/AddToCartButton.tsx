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
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.14)",
        background: isDisabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.10)",
        color: "rgba(255,255,255,0.92)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        fontWeight: 700,
      }}
      title={disabled ? "Unavailable" : "Add to cart"}
    >
      {adding ? "Added" : "Add to Cart"}
    </button>
  );
}
