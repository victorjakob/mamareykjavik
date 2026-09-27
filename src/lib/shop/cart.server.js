// Server-side shop cart. A cart belongs to the signed-in user's email, or to
// the browser's guest_id cookie — decided here, never by the browser.
// Prices always come from the products table.

import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export async function getCartOwner() {
  const session = await getServerSession(authOptions);
  if (session?.user?.email) return { email: session.user.email, session };
  const jar = await cookies();
  const guestId = jar.get("guest_id")?.value || null;
  return guestId ? { guest_id: guestId, session: null } : { session: null };
}

function ownerFilter(owner) {
  if (owner.email) return { email: owner.email };
  if (owner.guest_id) return { guest_id: owner.guest_id };
  return null;
}

export async function findPendingCart(supabase, owner) {
  const filter = ownerFilter(owner);
  if (!filter) return null;
  const { data, error } = await supabase
    .from("carts")
    .select("id, price")
    .match(filter)
    .eq("status", "pending")
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

const ITEM_SELECT = `
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
`;

/** Same shape the cart page has always used: { cart, items } */
export async function fetchCartData(owner) {
  const supabase = createServerSupabase();
  const cart = await findPendingCart(supabase, owner);
  if (!cart) return { cart: null, items: [] };
  const { data: items, error } = await supabase
    .from("cart_items")
    .select(ITEM_SELECT)
    .eq("cart_id", cart.id);
  if (error) throw error;
  return { cart, items: items || [] };
}

export function cartSubtotal(items) {
  return (items || []).reduce(
    (sum, item) => sum + (Number(item.products?.price) || 0) * (Number(item.quantity) || 0),
    0
  );
}

async function recalcCartPrice(supabase, cartId) {
  const { data: items } = await supabase
    .from("cart_items")
    .select("quantity, products ( price )")
    .eq("cart_id", cartId);
  await supabase
    .from("carts")
    .update({ price: cartSubtotal(items) })
    .eq("id", cartId);
}

export async function addToCart(owner, productId, quantity) {
  const filter = ownerFilter(owner);
  if (!filter) throw Object.assign(new Error("No cart owner"), { status: 400 });
  const qty = Math.max(1, Math.min(99, parseInt(quantity, 10) || 1));

  const supabase = createServerSupabase();
  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, price")
    .eq("id", productId)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!product) {
    throw Object.assign(new Error("Product not available"), { status: 404 });
  }

  let cart = await findPendingCart(supabase, owner);
  if (!cart) {
    const { data: newCart, error } = await supabase
      .from("carts")
      .insert({ ...filter, status: "pending", price: 0 })
      .select("id, price")
      .single();
    if (error) throw error;
    cart = newCart;
  }

  const { error: iErr } = await supabase.from("cart_items").insert({
    cart_id: cart.id,
    product_id: product.id,
    quantity: qty,
    price: (Number(product.price) || 0) * qty,
  });
  if (iErr) throw iErr;

  await recalcCartPrice(supabase, cart.id);
  return cart.id;
}

async function assertItemInOwnersCart(supabase, owner, itemId) {
  const cart = await findPendingCart(supabase, owner);
  if (!cart) return null;
  const { data: item } = await supabase
    .from("cart_items")
    .select("id, cart_id")
    .eq("id", itemId)
    .maybeSingle();
  return item && item.cart_id === cart.id ? cart : null;
}

export async function updateCartItem(owner, itemId, quantity) {
  const supabase = createServerSupabase();
  const cart = await assertItemInOwnersCart(supabase, owner, itemId);
  if (!cart) throw Object.assign(new Error("Item not found"), { status: 404 });
  const qty = parseInt(quantity, 10);
  if (!Number.isInteger(qty) || qty <= 0) {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: Math.min(qty, 99) })
      .eq("id", itemId);
    if (error) throw error;
  }
  await recalcCartPrice(supabase, cart.id);
}

export async function removeCartItem(owner, itemId) {
  const supabase = createServerSupabase();
  const cart = await assertItemInOwnersCart(supabase, owner, itemId);
  if (!cart) throw Object.assign(new Error("Item not found"), { status: 404 });
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw error;
  await recalcCartPrice(supabase, cart.id);
}

export async function cartItemCount(owner) {
  const supabase = createServerSupabase();
  const cart = await findPendingCart(supabase, owner);
  if (!cart) return 0;
  const { count } = await supabase
    .from("cart_items")
    .select("*", { count: "exact", head: true })
    .eq("cart_id", cart.id);
  return count || 0;
}
