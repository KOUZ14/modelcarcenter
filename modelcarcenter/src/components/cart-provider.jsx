'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadCartItems, saveCartItems, toNumberPrice } from '@/lib/cart';

const CartContext = createContext(null);

function normalizeCartItem(input) {
  const id = input?.id != null ? String(input.id) : '';
  const title = input?.title ? String(input.title) : 'Item';
  const price = toNumberPrice(input?.price);
  const image = input?.image ? String(input.image) : (input?.image_url ? String(input.image_url) : null);
  const currency = input?.currency ? String(input.currency) : 'USD';
  const quantity = Number.isFinite(input?.quantity) ? input.quantity : Number.parseInt(input?.quantity ?? '1', 10);

  return {
    id,
    title,
    price,
    currency,
    image,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(loadCartItems());
  }, []);

  useEffect(() => {
    saveCartItems(items);
  }, [items]);

  const api = useMemo(() => {
    const addItem = (item, quantity = 1) => {
      const normalized = normalizeCartItem({ ...item, quantity });
      if (!normalized.id) return;

      setItems((prev) => {
        const idx = prev.findIndex((p) => String(p.id) === normalized.id);
        if (idx === -1) return [normalized, ...prev];
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: (next[idx].quantity || 1) + normalized.quantity,
        };
        return next;
      });
    };

    const removeItem = (id) => {
      const key = String(id);
      setItems((prev) => prev.filter((p) => String(p.id) !== key));
    };

    const setQuantity = (id, quantity) => {
      const key = String(id);
      const q = Number.parseInt(String(quantity), 10);
      if (!Number.isFinite(q) || q <= 0) return;
      setItems((prev) => prev.map((p) => (String(p.id) === key ? { ...p, quantity: q } : p)));
    };

    const clear = () => setItems([]);

    const total = items.reduce((sum, item) => sum + toNumberPrice(item.price) * (item.quantity || 1), 0);
    const currency = items[0]?.currency || 'USD';
    const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    return { items, addItem, removeItem, setQuantity, clear, total, currency, count };
  }, [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
