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
import { useCookieConsent } from "./CookieConsentProvider";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const { canSetFunctional } = useCookieConsent();
  const [cartItemCount, setCartItemCount] = useState(0);

  const refreshCartStatus = useCallback(async () => {
    const userEmail = session?.user?.email;
    let guestId = null;

    // Only get guest ID from cookies if functional cookies are allowed
    if (canSetFunctional) {
      guestId = Cookies.get("guest_id");
    }

    const cartQuery = {
      status: "pending",
      ...(userEmail ? { email: userEmail } : { guest_id: guestId }),
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
  }, [session, canSetFunctional]);

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
