"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  slug: string | null;
  imageUrl: string | null;
  basePrice: number;
  comparePrice: number | null;
  addedAt: string;
}

export interface Wishlist {
  sessionId: string;
  items: WishlistItem[];
}

interface WishlistContextType {
  wishlist: Wishlist | null;
  loading: boolean;
  /** Quick lookup — used by the heart-icon toggle. */
  isInWishlist: (productId: number) => boolean;
  addItem: (productId: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  toggleItem: (productId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

/**
 * The wishlist reuses the cart's session id when present so a single
 * anonymous identity owns both stores. Cart bootstrap also writes
 * `cart_session_id` to localStorage; this provider just reads it (and
 * mints one if the cart hasn't run yet) so the order of providers in
 * the layout doesn't matter.
 */
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = window.localStorage.getItem("cart_session_id");
  if (!sid) {
    sid = uuidv4();
    window.localStorage.setItem("cart_session_id", sid);
  }
  return sid;
}

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await apiRequest("/wishlist", {}, sessionId);
      setWishlist(data);
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) refresh();
  }, [sessionId, refresh]);

  const addItem = useCallback(
    async (productId: number) => {
      if (!sessionId) return;
      try {
        const data = await apiRequest(
          "/wishlist/items",
          {
            method: "POST",
            body: JSON.stringify({ productId }),
          },
          sessionId,
        );
        setWishlist(data);
      } catch (err) {
        console.error("Failed to add to wishlist", err);
      }
    },
    [sessionId],
  );

  const removeItem = useCallback(
    async (productId: number) => {
      if (!sessionId) return;
      try {
        const data = await apiRequest(
          `/wishlist/items/${productId}`,
          { method: "DELETE" },
          sessionId,
        );
        setWishlist(data);
      } catch (err) {
        console.error("Failed to remove from wishlist", err);
      }
    },
    [sessionId],
  );

  // Local lookup avoids a network round-trip per heart icon — the
  // wishlist payload is small enough to keep entirely in state.
  const productIdSet = useMemo(() => {
    const s = new Set<number>();
    for (const i of wishlist?.items ?? []) s.add(i.productId);
    return s;
  }, [wishlist]);

  const isInWishlist = useCallback(
    (productId: number) => productIdSet.has(productId),
    [productIdSet],
  );

  const toggleItem = useCallback(
    async (productId: number) => {
      if (productIdSet.has(productId)) await removeItem(productId);
      else await addItem(productId);
    },
    [productIdSet, addItem, removeItem],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        addItem,
        removeItem,
        toggleItem,
        refresh,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
