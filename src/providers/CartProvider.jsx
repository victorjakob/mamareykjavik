"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cartItemCount, setCartItemCount] = useState(0);

  const refreshCartStatus = useCallback(async () => {
    // The server works out whose cart it is (session email or the guest_id
    // cookie) and answers 0 when there's none.
    try {
      const res = await fetch("/api/shop/cart?count=1", { cache: "no-store" });
      const data = res.ok ? await res.json() : { count: 0 };
      setCartItemCount(data.count || 0);
    } catch {
      setCartItemCount(0);
    }
    // `session` is a deliberate dependency: re-count when the user signs in/out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
