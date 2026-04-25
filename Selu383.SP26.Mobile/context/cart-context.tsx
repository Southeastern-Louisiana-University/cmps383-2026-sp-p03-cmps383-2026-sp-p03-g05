import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type CartItemInput = {
  key: string;
  name: string;
  unitPrice: number;
  image: number;
  specialInstructions?: string;
};

export type CartItem = CartItemInput & {
  quantity: number;
};

export type ReplaceCartItemInput = CartItemInput & {
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
  setItemSpecialInstructions: (itemKey: string, value: string) => void;
  clearCart: () => void;
  replaceCart: (items: ReplaceCartItemInput[]) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [itemsByKey, setItemsByKey] = useState<Record<string, CartItem>>({});

  const normalizeSpecialInstructions = useCallback((value?: string) => {
    if (!value) {
      return '';
    }

    return value.slice(0, 300);
  }, []);

  const toggleCartItem = useCallback((item: CartItemInput) => {
    setItemsByKey((previous) => {
      const existing = previous[item.key];
      if (!existing) {
        return {
          ...previous,
          [item.key]: {
            ...item,
            specialInstructions: normalizeSpecialInstructions(item.specialInstructions),
            quantity: 1,
          },
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
  }, [normalizeSpecialInstructions]);

  const incrementItem = useCallback((item: CartItemInput) => {
    setItemsByKey((previous) => {
      const existing = previous[item.key];
      if (!existing) {
        return {
          ...previous,
          [item.key]: {
            ...item,
            specialInstructions: normalizeSpecialInstructions(item.specialInstructions),
            quantity: 1,
          },
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
  }, [normalizeSpecialInstructions]);

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

  const setItemSpecialInstructions = useCallback(
    (itemKey: string, value: string) => {
      setItemsByKey((previous) => {
        const existing = previous[itemKey];
        if (!existing) {
          return previous;
        }

        return {
          ...previous,
          [itemKey]: {
            ...existing,
            specialInstructions: normalizeSpecialInstructions(value),
          },
        };
      });
    },
    [normalizeSpecialInstructions]
  );

  const clearCart = useCallback(() => {
    setItemsByKey({});
  }, []);

  const replaceCart = useCallback((items: ReplaceCartItemInput[]) => {
    setItemsByKey(() => {
      const next: Record<string, CartItem> = {};

      items.forEach((item) => {
        const quantity = Math.max(0, Math.floor(item.quantity));
        if (!item.key || quantity < 1) {
          return;
        }

        const existing = next[item.key];
        if (existing) {
          existing.quantity += quantity;
          return;
        }

        next[item.key] = {
          key: item.key,
          name: item.name,
          unitPrice: item.unitPrice,
          image: item.image,
          specialInstructions: normalizeSpecialInstructions(item.specialInstructions),
          quantity,
        };
      });

      return next;
    });
  }, [normalizeSpecialInstructions]);

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
      setItemSpecialInstructions,
      clearCart,
      replaceCart,
    }),
    [
      cartCount,
      cartItems,
      subtotal,
      isInCart,
      getItemQuantity,
      toggleCartItem,
      incrementItem,
      decrementItem,
      removeItem,
      setItemSpecialInstructions,
      clearCart,
      replaceCart,
    ]
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
