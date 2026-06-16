import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "./types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "luma-cart";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (!canUseLocalStorage()) return [];
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!canUseLocalStorage()) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return {
      items,
      count,
      total,
      addItem(product) {
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          if (existing) {
            return current.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
          }
          return [...current, { product, quantity: 1 }];
        });
      },
      removeItem(productId) {
        setItems((current) => current.filter((item) => item.product.id !== productId));
      },
      setQuantity(productId, quantity) {
        const safeQuantity = Math.max(1, quantity);
        setItems((current) => current.map((item) => (item.product.id === productId ? { ...item, quantity: safeQuantity } : item)));
      },
      clearCart() {
        setItems([]);
      }
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
