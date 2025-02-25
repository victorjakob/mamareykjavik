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

  // Updated fetchUserData function with mounted flag
  const fetchUserData = async (session) => {
    let mounted = true;
    setLoading(true);

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
      if (mounted) setUser(session.user);

      // Fetch profile first to avoid unnecessary API calls
      const profileData = await fetchProfile(session.user.id);

      if (!profileData) {
        console.warn("No profile found. Logging out.");
        await supabase.auth.signOut();
        if (mounted) setUser(null);
        return;
      }

      // Only fetch additional data if profile exists
      const [cartCount, roles] = await Promise.all([
        fetchCartCount(session.user.email),
        fetchUserRoles(session.user.id, session.user.email),
      ]);

      if (mounted) {
        setProfile(profileData);
        setCartCount(cartCount);
        setIsAdmin(roles.isAdmin);
        setIsHost(roles.isHost);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      if (mounted) setError(error.message);
    } finally {
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initializeSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          await fetchUserData(session);
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        if (mounted) setError(error.message);
      }
    };

    initializeSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        console.log("Auth state changed. Fetching new session...");
        await fetchUserData(session);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const updateCartCount = useCallback(async (cartId) => {
    let mounted = true;

    if (!cartId) return;
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id")
        .eq("cart_id", cartId);

      if (error) throw error;
      if (mounted) {
        setCartCount(data?.length || 0);
      }
    } catch (error) {
      console.error("Error updating cart count:", error.message);
      if (mounted) setError(error.message);
    }

    return () => {
      mounted = false;
    };
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
