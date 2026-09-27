// Browser-side cart helpers. All reads/writes go through /api/shop/cart,
// which works out whose cart it is from the session / guest_id cookie.
// (Server components use fetchCartData from @/lib/shop/cart.server.)

async function cartRequest(url, options) {
  const res = await fetch(url, { cache: "no-store", ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Cart request failed");
  return data;
}

export const CartService = {
  // Fetch cart and items for the current visitor
  async fetchCartData() {
    const { cart, items } = await cartRequest("/api/shop/cart");
    return { cart, items: items || [] };
  },

  // Calculate cart total
  calculateTotal(items) {
    return items.reduce(
      (sum, item) => sum + item.products.price * item.quantity,
      0
    );
  },

  // Modify cart item quantity
  async updateItemQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
      return this.removeItem(itemId);
    }
    await cartRequest("/api/shop/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity: newQuantity }),
    });
    return true;
  },

  // Remove item from cart
  async removeItem(itemId) {
    await cartRequest(`/api/shop/cart?itemId=${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });
    return true;
  },
};
