import { supabase } from "@/util/supabase/client";

export const CartService = {
  // Fetch cart and items
  async fetchCartData(userEmail, guestId) {
    const cartFilter = userEmail ? { email: userEmail } : { guest_id: guestId };

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id, price")
      .match(cartFilter)
      .eq("status", "pending")
      .maybeSingle();
    if (cartError && cartError.code !== "PGRST116") {
      throw cartError;
    }

    if (!cart) {
      return { cart: null, items: [] };
    }

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

    return { cart, items };
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

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", itemId);

    if (error) throw error;
    return true;
  },

  // Remove item from cart
  async removeItem(itemId) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
    return true;
  },
};
