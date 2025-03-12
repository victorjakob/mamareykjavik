"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropagateLoader from "react-spinners/PropagateLoader";
import { supabase } from "@/util/supabase/client";
import ProductCard from "./ProductCard";
import Checkout from "./Checkout";
import Cookies from "js-cookie";
import { CartService } from "@/util/cart-util";

export default function Master({ initialCart, initialItems }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState(initialItems);
  const [cartTotal, setCartTotal] = useState(
    CartService.calculateTotal(initialItems)
  );
  const [session, setSession] = useState(null);

  const router = useRouter();

  const calculateTotal = (items) => {
    return items.reduce(
      (sum, item) => sum + item.products.price * item.quantity,
      0
    );
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCartData = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const currentSession = sessionData.session;
        if (isMounted) setSession(currentSession);

        const guestId = Cookies.get("guest_id");
        if (!currentSession && !guestId) {
          if (isMounted) setLoading(false);
          return;
        }

        const { data: cart, error: cartError } = await supabase
          .from("carts")
          .select("id, price")
          .eq(
            currentSession ? "email" : "guest_id",
            currentSession ? currentSession.user.email : guestId
          )
          .eq("status", "pending")
          .maybeSingle();

        if (cartError && cartError.code !== "PGRST116") {
          throw cartError;
        }

        if (cart) {
          const { data: items, error: itemsError } = await supabase
            .from("cart_items")
            .select(
              `
              id,
              quantity,
              price,
              product_id,
              products (
                id,
                name,
                price,
                image
              )
            `
            )
            .eq("cart_id", cart.id);

          if (itemsError) throw itemsError;

          setCartItems(items);
          setCartTotal(calculateTotal(items));
        } else {
          setCartItems([]);
          setCartTotal(0);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
        if (isMounted) setError("Failed to load cart items");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCartData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCartUpdate = (newItems) => {
    const filteredItems = newItems.filter((item) => item.quantity > 0);
    setCartItems(filteredItems);
    setCartTotal(CartService.calculateTotal(filteredItems));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <PropagateLoader color="#10B981" size={12} speedMultiplier={0.8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full">
          <div className="text-red-500 text-center font-medium">{error}</div>
        </div>
      </div>
    );
  }

  if (!initialCart && cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-6 lg:pt-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-md mx-auto">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">
              Your cart is empty
            </h2>
            <button
              onClick={() => router.push("/shop")}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium
                hover:bg-emerald-600 transition-colors duration-200 shadow-sm
                hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 
                focus:ring-offset-2"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 lg:pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8 ">
            <h2 className="lg:pt-6 text-2xl font-medium text-right  text-gray-900">
              Shopping Cart ({cartItems.length})
            </h2>
            <div className="space-y-6">
              {cartItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  cartItems={cartItems}
                  onCartUpdate={handleCartUpdate}
                />
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <Checkout cartTotal={cartTotal} cartItems={cartItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
