"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/util/supabase/client";
import Cookies from "js-cookie";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cartItemCount, setCartItemCount] = useState(0);

  const refreshCartStatus = useCallback(async () => {
    const userEmail = session?.user?.email;
    let guestId = null;

    // Always try to get guest ID from cookies - cart functionality is essential
      guestId = Cookies.get("guest_id");

    const cartQuery = {
      status: "pending",
      ...(userEmail ? { email: userEmail } : guestId ? { guest_id: guestId } : {}),
    };

    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .match(cartQuery)
      .maybeSingle();

    if (cart?.id) {
      const { count } = await supabase
        .from("cart_items")
        .select("*", { count: "exact", head: true })
        .eq("cart_id", cart.id);

      setCartItemCount(count || 0);
    } else {
      setCartItemCount(0);
    }
  }, [session]);

  useEffect(() => {
    refreshCartStatus();
  }, [refreshCartStatus]);

  return (
    <CartContext.Provider value={{ cartItemCount, refreshCartStatus }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
