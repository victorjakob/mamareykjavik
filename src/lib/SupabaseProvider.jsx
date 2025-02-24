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
      .maybeSingle();

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
  const [profile, setProfile] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch profile data
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, user_id")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;
      return profileData;
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      return null;
    }
  }, []);

  // Fetch user and related data
  useEffect(() => {
    let mounted = true;

    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setUser(session.user);

        // Fetch profile and cart data in parallel
        const [profileData, cartCount] = await Promise.all([
          fetchProfile(session.user.id),
          fetchCartCount(session.user.email),
        ]);

        if (!mounted) return;

        setProfile(profileData);
        setCartCount(cartCount);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        if (error.message !== "Auth session missing!" && mounted) {
          setError(error.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session) {
        setUser(session.user);
        const [profileData, cartCount] = await Promise.all([
          fetchProfile(session.user.id),
          fetchCartCount(session.user.email),
        ]);
        if (mounted) {
          setProfile(profileData);
          setCartCount(cartCount);
        }
      } else {
        setUser(null);
        setProfile(null);
        setCartCount(0);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

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
      setProfile(null);
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
      profile,
      cartCount,
      setCartCount,
      loading,
      error,
      signOut,
      updateCartCount,
    }),
    [user, profile, cartCount, loading, error, signOut, updateCartCount]
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
