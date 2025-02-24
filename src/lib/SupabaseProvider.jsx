"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { supabase } from "./supabase";

const SupabaseContext = createContext();

// Extract cart fetching logic into a separate function
const fetchCartCount = async (userEmail) => {
  try {
    const { data: carts, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("email", userEmail)
      .eq("status", "pending")
      .maybeSingle(); // Changed from single() to maybeSingle()

    if (cartError) throw cartError;

    if (!carts) return 0;

    const { data: cartItems, error: itemsError } = await supabase
      .from("cart_items")
      .select("id")
      .eq("cart_id", carts.id);

    if (itemsError) throw itemsError;

    return cartItems?.length || 0;
  } catch (error) {
    console.error("Error fetching cart count:", error.message);
    return 0;
  }
};

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user and cart info
  useEffect(() => {
    let mounted = true; // Prevent state updates after unmount

    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!mounted) return;

        setUser(user);

        if (user) {
          const count = await fetchCartCount(user.email);
          if (mounted) setCartCount(count);
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        if (mounted) setError(error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        const count = await fetchCartCount(session.user.email);
        if (mounted) setCartCount(count);
      } else {
        setCartCount(0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateCartCount = useCallback(async (cartId) => {
    if (!cartId) return;
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id")
        .eq("cart_id", cartId);

      if (error) throw error;
      setCartCount(data?.length || 0);
    } catch (error) {
      console.error("Error updating cart count:", error.message);
      setError(error.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setCartCount(0);
    } catch (error) {
      console.error("Error signing out:", error.message);
      setError(error.message);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      supabase,
      user,
      cartCount,
      setCartCount,
      loading,
      error,
      signOut,
      updateCartCount,
    }),
    [user, cartCount, loading, error, signOut, updateCartCount]
  );

  if (error) {
    // You might want to add an error boundary or error UI here
    console.error("SupabaseProvider Error:", error);
  }

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
