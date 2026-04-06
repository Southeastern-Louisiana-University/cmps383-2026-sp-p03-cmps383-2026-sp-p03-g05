import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type CartItemInput = {
  key: string;
  name: string;
  unitPrice: number;
  image: number;
};

export type CartItem = CartItemInput & {
  quantity: number;
};

type CartContextValue = {
  cartCount: number;
  cartItems: CartItem[];
  subtotal: number;
  isInCart: (itemKey: string) => boolean;
  getItemQuantity: (itemKey: string) => number;
  toggleCartItem: (item: CartItemInput) => void;
  incrementItem: (item: CartItemInput) => void;
  decrementItem: (itemKey: string) => void;
  removeItem: (itemKey: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [itemsByKey, setItemsByKey] = useState<Record<string, CartItem>>({});

  const toggleCartItem = useCallback((item: CartItemInput) => {
    setItemsByKey((previous) => {
      if (previous[item.key]) {
        const { [item.key]: _, ...rest } = previous;
        return rest;
      }

      return {
        ...previous,
        [item.key]: { ...item, quantity: 1 },
      };
    });
  }, []);

  const incrementItem = useCallback((item: CartItemInput) => {
    setItemsByKey((previous) => {
      const existing = previous[item.key];
      if (!existing) {
        return {
          ...previous,
          [item.key]: { ...item, quantity: 1 },
        };
      }

      return {
        ...previous,
        [item.key]: {
          ...existing,
          quantity: existing.quantity + 1,
        },
      };
    });
  }, []);

  const decrementItem = useCallback((itemKey: string) => {
    setItemsByKey((previous) => {
      const existing = previous[itemKey];
      if (!existing) {
        return previous;
      }

      if (existing.quantity <= 1) {
        const { [itemKey]: _, ...rest } = previous;
        return rest;
      }

      return {
        ...previous,
        [itemKey]: {
          ...existing,
          quantity: existing.quantity - 1,
        },
      };
    });
  }, []);

  const removeItem = useCallback((itemKey: string) => {
    setItemsByKey((previous) => {
      if (!previous[itemKey]) {
        return previous;
      }

      const { [itemKey]: _, ...rest } = previous;
      return rest;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItemsByKey({});
  }, []);

  const cartItems = useMemo(() => Object.values(itemsByKey), [itemsByKey]);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cartItems]
  );

  const isInCart = useCallback(
    (itemKey: string) => (itemsByKey[itemKey]?.quantity ?? 0) > 0,
    [itemsByKey]
  );

  const getItemQuantity = useCallback(
    (itemKey: string) => itemsByKey[itemKey]?.quantity ?? 0,
    [itemsByKey]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartCount,
      cartItems,
      subtotal,
      isInCart,
      getItemQuantity,
      toggleCartItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
    }),
    [cartCount, cartItems, subtotal, isInCart, getItemQuantity, toggleCartItem, incrementItem, decrementItem, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
