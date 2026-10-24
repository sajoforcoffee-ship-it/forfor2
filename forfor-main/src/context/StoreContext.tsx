import { createContext, useEffect, useState, useCallback } from 'react';

export interface CartItem {
  key: string;
  productId: number;
  name: string;
  image: string;
  price: number;
  weight: string;
  grind: string;
  quantity: number;
  permalink: string;
}

export interface FavoriteItem {
  productId: number;
  name: string;
  image: string;
  permalink: string;
}

interface StoreContextValue {
  cart: CartItem[];
  favorites: number[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'key' | 'quantity'>, quantity?: number) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (productId: number) => boolean;
}

export const StoreContext = createContext<StoreContextValue>({
  cart: [],
  favorites: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
});

const CART_KEY = 'fc-cart';
const FAV_KEY = 'fc-favorites';

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(FAV_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = useCallback((item: Omit<CartItem, 'key' | 'quantity'>, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.min(99, Math.floor(quantity)));
    const key = `${item.productId}-${item.weight}-${item.grind}`;
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: Math.min(99, i.quantity + safeQuantity) } : i);
      }
      return [...prev, { ...item, key, quantity: safeQuantity }];
    });
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart(prev => prev.filter(i => i.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, qty: number) => {
    if (qty < 1) return;
    setCart(prev => prev.map(i => i.key === key ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites(prev => {
      if (prev.includes(item.productId)) {
        return prev.filter(id => id !== item.productId);
      }
      return [...prev, item.productId];
    });
  }, []);

  const isFavorite = useCallback((productId: number) => favorites.includes(productId), [favorites]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <StoreContext.Provider value={{
      cart, favorites, cartCount, cartTotal,
      addToCart, removeFromCart, updateQuantity, clearCart,
      toggleFavorite, isFavorite,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

