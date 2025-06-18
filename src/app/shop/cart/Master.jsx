"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import Checkout from "./Checkout";
import { CartService } from "@/util/cart-util";
import { useCart } from "@/providers/CartProvider";

export default function Master({ initialCart, initialItems, user }) {
  const [cartItems, setCartItems] = useState(initialItems);
  const [cartTotal, setCartTotal] = useState(
    CartService.calculateTotal(initialItems)
  );
  const router = useRouter();
  const { refreshCartStatus } = useCart();

  // Update local state and context after cart actions
  const handleCartUpdate = async (newItems) => {
    setCartItems(newItems);
    setCartTotal(CartService.calculateTotal(newItems));
    refreshCartStatus(); // update topbar icon
  };

  // Remove item from cart
  const handleRemoveItem = async (itemId) => {
    await CartService.removeItem(itemId);
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    await handleCartUpdate(updatedItems);
  };

  // Update quantity
  const handleUpdateQuantity = async (itemId, newQty) => {
    await CartService.updateItemQuantity(itemId, newQty);
    const updatedItems = cartItems
      .map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
      .filter((item) => item.quantity > 0);
    await handleCartUpdate(updatedItems);
  };

  if (!initialCart || cartItems.length === 0) {
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
                  onRemove={handleRemoveItem}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
          </div>
          <div className="lg:sticky lg:top-8">
            <Checkout cartTotal={cartTotal} cartItems={cartItems} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
