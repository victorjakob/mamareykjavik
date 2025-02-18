"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SupabaseContext = createContext();

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch user and cart info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        console.log("Current user:", user);
        setUser(user);

        // Fetch cart count through carts table
        if (user) {
          const { data: cart } = await supabase
            .from("carts")
            .select("id")
            .eq("email", user.email)
            .single();

          console.log("User's cart:", cart);

          if (cart) {
            const { data: cartItems } = await supabase
              .from("cart_items")
              .select("id")
              .eq("cart_id", cart.id);

            console.log("Cart items:", cartItems);
            setCartCount(cartItems?.length || 0);
          } else {
            setCartCount(0);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: cart } = await supabase
          .from("carts")
          .select("id")
          .eq("email", session.user.email)
          .single();

        console.log("Cart after auth change:", cart);

        if (cart) {
          const { data: cartItems } = await supabase
            .from("cart_items")
            .select("id")
            .eq("cart_id", cart.id);
          console.log("Cart items after auth change:", cartItems);
          setCartCount(cartItems?.length || 0);
        } else {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("Attempting to sign out...");
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
    else console.log("Successfully signed out");
  };

  const updateCartCount = async (cartId) => {
    console.log("Updating cart count for cart ID:", cartId);
    if (!cartId) return;
    const { data, error } = await supabase
      .from("cart_items")
      .select("id")
      .eq("cart_id", cartId);

    console.log("Cart items after update:", data);
    if (!error) setCartCount(data?.length || 0);
  };

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        user,
        cartCount,
        setCartCount,
        loading,
        signOut,
        updateCartCount,
      }}
    >
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
