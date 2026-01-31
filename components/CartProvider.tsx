"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { id: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  addItem: (id: string, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "hammys_cart_v1";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const data = raw ? (JSON.parse(raw) as CartItem[]) : [];
    if (!Array.isArray(data)) return [];
    return data
      .map((i) => ({ id: String(i.id), qty: Number(i.qty || 0) }))
      .filter((i) => i.id && Number.isFinite(i.qty) && i.qty > 0);
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  useEffect(() => {
    writeCart(items);
  }, [items]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setItems(readCart());
    }
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (id: string, qty = 1) => {
      if (!id || !Number.isFinite(qty) || qty <= 0) return;
      setItems((prev) => {
        const next = [...prev];
        const idx = next.findIndex((i) => i.id === id);
        if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        else next.push({ id, qty });
        return next;
      });
    };

    const removeItem = (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const setQty = (id: string, qty: number) => {
      if (!Number.isFinite(qty)) return;
      setItems((prev) => {
        if (qty <= 0) return prev.filter((i) => i.id !== id);
        return prev.map((i) => (i.id === id ? { ...i, qty } : i));
      });
    };

    const clear = () => setItems([]);

    const count = items.reduce((sum, i) => sum + i.qty, 0);

    return { items, addItem, removeItem, setQty, clear, count };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
