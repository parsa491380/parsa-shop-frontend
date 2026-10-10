"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  addBasketItem,
  clearBasket,
  getBasket,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  removeBasketLine,
  updateBasketLine,
  type StoreBasket,
  type StoreUser,
} from "@/lib/store-api";

interface StoreContextValue {
  basket: StoreBasket | null;
  user: StoreUser | null;
  loading: boolean;
  refreshingBasket: boolean;
  error: string | null;
  refreshBasket: () => Promise<void>;
  addToBasket: (productId: number, quantity?: number) => Promise<StoreBasket>;
  updateBasketQuantity: (lineId: number, quantity: number) => Promise<void>;
  removeFromBasket: (lineId: number) => Promise<void>;
  emptyBasket: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<StoreUser>;
  signUp: (input: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<StoreUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<StoreUser | null>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [basket, setBasket] = useState<StoreBasket | null>(null);
  const [user, setUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingBasket, setRefreshingBasket] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBasket = async () => {
    try {
      setRefreshingBasket(true);
      setError(null);
      setBasket(await getBasket());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load the basket.");
    } finally {
      setRefreshingBasket(false);
    }
  };

  const refreshUser = async () => {
    try {
      const result = await getCurrentUser();
      setUser(result.user);
      return result.user;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await Promise.all([refreshBasket(), refreshUser()]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const addToBasket = async (productId: number, quantity = 1) => {
    const result = await addBasketItem(productId, quantity);
    setBasket(result.basket);
    return result.basket;
  };

  const updateBasketQuantity = async (lineId: number, quantity: number) => {
    const nextBasket = await updateBasketLine(lineId, quantity);
    setBasket(nextBasket);
  };

  const removeFromBasket = async (lineId: number) => {
    const nextBasket = await removeBasketLine(lineId);
    setBasket(nextBasket);
  };

  const emptyBasket = async () => {
    const nextBasket = await clearBasket();
    setBasket(nextBasket);
  };

  const signIn = async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    setUser(result.user);
    await refreshBasket();
    return result.user;
  };

  const signUp = async (input: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    const result = await registerRequest(input);
    setUser(result.user);
    await refreshBasket();
    return result.user;
  };

  const signOut = async () => {
    await logoutRequest();
    setUser(null);
    await refreshBasket();
  };

  const value = useMemo<StoreContextValue>(
    () => ({
      basket,
      user,
      loading,
      refreshingBasket,
      error,
      refreshBasket,
      addToBasket,
      updateBasketQuantity,
      removeFromBasket,
      emptyBasket,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [basket, user, loading, refreshingBasket, error],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider.");
  }

  return context;
}
