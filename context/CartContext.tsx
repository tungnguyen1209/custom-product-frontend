"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

export interface CanvasSnapshot {
  width?: number;
  height?: number;
  baseFile?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elements?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface CartItem {
  productId: number;
  productName: string;
  customization: Record<string, any>;
  canvas?: CanvasSnapshot;
  previewImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  sessionId: string;
  items: CartItem[];
  updatedAt: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  updateItem: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const openMiniCart = useCallback(() => setIsMiniCartOpen(true), []);
  const closeMiniCart = useCallback(() => setIsMiniCartOpen(false), []);

  useEffect(() => {
    let sid = localStorage.getItem('cart_session_id');
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem('cart_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await apiRequest('/cart', {}, sessionId);
      setCart(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      refreshCart();
    }
  }, [sessionId, refreshCart]);

  const addItem = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    if (!sessionId) return;
    try {
      const updatedCart = await apiRequest('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ ...item, quantity: item.quantity ?? 1 }),
      }, sessionId);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateItem = async (productId: number, quantity: number) => {
    if (!sessionId) return;
    try {
      const updatedCart = await apiRequest(`/cart/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }, sessionId);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeItem = async (productId: number) => {
    if (!sessionId) return;
    try {
      const updatedCart = await apiRequest(`/cart/items/${productId}`, {
        method: 'DELETE',
      }, sessionId);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearCart = async () => {
    if (!sessionId) return;
    try {
      await apiRequest('/cart', { method: 'DELETE' }, sessionId);
      setCart({ sessionId, items: [], updatedAt: new Date().toISOString() });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      error,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      refreshCart,
      isMiniCartOpen,
      openMiniCart,
      closeMiniCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
