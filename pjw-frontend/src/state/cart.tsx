import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const CART_STORAGE_KEY = "pjw_cart_v1";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface AddCartItemInput {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  addItem: (item: AddCartItemInput) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function normalizeLoadedItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const candidate = item as Record<string, unknown>;
      const id = String(candidate.id ?? "").trim();
      const name = String(candidate.name ?? "").trim();
      const price = Number(candidate.price ?? 0);
      const imageUrl = String(candidate.image_url ?? "");
      const quantity = Number(candidate.quantity ?? 0);

      if (!id || !name || !Number.isFinite(price) || !Number.isFinite(quantity)) return null;
      if (quantity <= 0) return null;

      return {
        id,
        name,
        price,
        image_url: imageUrl,
        quantity,
      } satisfies CartItem;
    })
    .filter((item): item is CartItem => item !== null);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      return normalizeLoadedItems(JSON.parse(saved));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems,
      addItem: (item) => {
        setItems((current) => {
          const existing = current.find((entry) => entry.id === item.id);
          if (!existing) {
            return [...current, { ...item, quantity: 1 }];
          }

          return current.map((entry) =>
            entry.id === item.id
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry
          );
        });
      },
      updateItemQuantity: (itemId, quantity) => {
        setItems((current) => {
          if (quantity <= 0) {
            return current.filter((item) => item.id !== itemId);
          }

          return current.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
        });
      },
      removeItem: (itemId) => {
        setItems((current) => current.filter((item) => item.id !== itemId));
      },
      clearCart: () => {
        setItems([]);
      },
    }),
    [items, totalItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
