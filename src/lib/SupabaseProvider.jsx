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
import Cookies from "js-cookie";

const SupabaseContext = createContext();

// Extract cart fetching logic into a separate function
const fetchCartCount = async (userEmail, guestId) => {
  console.log("⏳ Fetching cart count for:", userEmail || guestId);
  try {
    let query = supabase.from("carts").select("id").eq("status", "pending");

    if (userEmail) query = query.eq("email", userEmail);
    else if (guestId) query = query.eq("guest_id", guestId);
    else return 0;

    const { data: carts, error: cartError } = await query.maybeSingle();
    if (cartError) throw cartError;
    if (!carts) return 0;

    console.log("✅ Found cart:", carts);

    const { data: cartItems, error: itemsError } = await supabase
      .from("cart_items")
      .select("id")
      .eq("cart_id", carts.id);

    if (itemsError) throw itemsError;

    console.log("✅ Cart items count:", cartItems?.length || 0);
    return cartItems?.length || 0;
  } catch (error) {
    console.error("❌ Error fetching cart count:", error.message);
    return 0;
  }
};

const mergeGuestCart = async (guestId, userEmail) => {
  try {
    // Get guest cart
    const { data: guestCart } = await supabase
      .from("carts")
      .select("id, cart_items(*)")
      .eq("guest_id", guestId)
      .eq("status", "pending")
      .maybeSingle();

    if (!guestCart) return;

    // Get or create user cart
    const { data: userCart } = await supabase
      .from("carts")
      .select("id")
      .eq("email", userEmail)
      .eq("status", "pending")
      .maybeSingle();

    let userCartId;
    if (!userCart) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert({ email: userEmail, status: "pending", price: 0 })
        .select()
        .single();
      userCartId = newCart.id;
    } else {
      userCartId = userCart.id;
    }

    // Move items from guest cart to user cart
    if (guestCart.cart_items?.length > 0) {
      const updatedItems = guestCart.cart_items.map((item) => ({
        ...item,
        cart_id: userCartId,
      }));

      // Insert items into user's cart
      await supabase.from("cart_items").insert(updatedItems);
    }

    // Delete guest cart
    await supabase.from("carts").delete().eq("id", guestCart.id);
  } catch (error) {
    console.error("Error merging carts:", error);
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
    console.log("⏳ Fetching profile for user:", userId);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      console.log("✅ Fetched profile:", profileData);
      return profileData;
    } catch (error) {
      console.error("❌ Error fetching profile:", error.message);
      return null;
    }
  }, []);

  // Fetch role and host status
  const fetchUserRoles = useCallback(async (userId, userEmail) => {
    console.log("⏳ Fetching user roles for user:", userId);
    try {
      const [{ data: roleData }, { data: eventData }] = await Promise.all([
        supabase
          .from("roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase.from("events").select("host").eq("host", userEmail),
      ]);

      console.log("✅ Role data:", roleData);
      console.log("✅ Event data:", eventData);

      return {
        isAdmin: roleData?.role === "admin" || false,
        isHost: Boolean(eventData?.length),
      };
    } catch (error) {
      console.error("❌ Error fetching user roles:", error.message);
      return { isAdmin: false, isHost: false };
    }
  }, []);

  // Updated fetchUserData function with better session handling
  const fetchUserData = async (session) => {
    console.log("🔍 Fetching user data for session:", session);
    setLoading(true);

    if (!session || !session.user) {
      console.log("🚨 No session found. Resetting state.");
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      setIsHost(false);
      setCartCount(0);
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 Fetching profile...");
      const profileData = await fetchProfile(session.user.id);
      console.log("✅ Profile Data:", profileData);

      console.log("🔍 Fetching user roles...");
      const roles = await fetchUserRoles(session.user.id, session.user.email);
      console.log("✅ Roles Data:", roles);

      setUser(session.user);
      setProfile(profileData);
      setIsAdmin(roles.isAdmin);
      setIsHost(roles.isHost);

      console.log("🔍 Fetching cart count...");
      const guestId = Cookies.get("guest_id");
      const cartCount = await fetchCartCount(session.user.email, guestId);
      console.log("✅ Cart Count:", cartCount);
      setCartCount(cartCount);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      setError(error.message);
    } finally {
      console.log("✅ Done fetching user data. Setting `loading = false`.");
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("🔍 Initial session state:", {
          hasSession: !!data?.session,
          user: data?.session?.user?.email,
        });

        if (error) throw error;
        if (mounted) {
          await fetchUserData(data?.session);
        }
      } catch (error) {
        console.error("❌ Error initializing session:", error);
        if (mounted) setError(error.message);
      }
    };

    initializeSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          console.log("🔄 Auth state changed:", {
            event: _event,
            hasSession: !!session,
            user: session?.user?.email,
          });
          await fetchUserData(session);
        }
      }
    );

    // Improved cross-tab syncing without page reload
    const syncAuthAcrossTabs = async (event) => {
      if (event.key === "supabase.auth.token") {
        console.log("Auth state changed in another tab. Refreshing session...");
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          await fetchUserData(data?.session);
        }
      }
    };
    window.addEventListener("storage", syncAuthAcrossTabs);

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
      window.removeEventListener("storage", syncAuthAcrossTabs);
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
