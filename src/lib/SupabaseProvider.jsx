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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHost, setIsHost] = useState(false);

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

  // Fetch role and host status
  const fetchUserRoles = useCallback(async (userId, userEmail) => {
    try {
      const [{ data: roleData }, { data: eventData }] = await Promise.all([
        supabase
          .from("roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase.from("events").select("host").eq("host", userEmail),
      ]);

      return {
        isAdmin: roleData?.role === "admin" || false,
        isHost: Boolean(eventData?.length),
      };
    } catch (error) {
      console.error("Error fetching user roles:", error.message);
      return { isAdmin: false, isHost: false };
    }
  }, []);

  // Fetch user and related data
  useEffect(() => {
    let mounted = true;

    const fetchUserData = async (session) => {
      if (!session) {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsHost(false);
          setCartCount(0);
          setLoading(false);
        }
        return;
      }

      try {
        // Set user immediately
        if (mounted) {
          setUser(session.user);
        }

        // Fetch all user data in parallel
        const [profileData, cartCount, roles] = await Promise.all([
          fetchProfile(session.user.id),
          fetchCartCount(session.user.email),
          fetchUserRoles(session.user.id, session.user.email),
        ]);

        if (mounted) {
          setProfile(profileData);
          setCartCount(cartCount);
          setIsAdmin(roles.isAdmin);
          setIsHost(roles.isHost);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        if (mounted) {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUserData(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setLoading(true); // Set loading true when auth state changes
        await fetchUserData(session);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile, fetchUserRoles]);

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
      setIsAdmin(false);
      setIsHost(false);
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
      isAdmin,
      isHost,
      setCartCount,
      loading,
      error,
      signOut,
      updateCartCount,
    }),
    [
      user,
      profile,
      cartCount,
      isAdmin,
      isHost,
      loading,
      error,
      signOut,
      updateCartCount,
    ]
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
