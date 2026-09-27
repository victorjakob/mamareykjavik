// /api/shop/cart — the caller's shop cart (signed-in email or guest_id cookie).
//   GET                         → { cart, items, count }
//   GET ?count=1                → { count }
//   POST   { productId, quantity }
//   PATCH  { itemId, quantity }   (quantity <= 0 removes the item)
//   DELETE ?itemId=…
import { NextResponse } from "next/server";
import {
  getCartOwner,
  fetchCartData,
  addToCart,
  updateCartItem,
  removeCartItem,
  cartItemCount,
} from "@/lib/shop/cart.server";

export const dynamic = "force-dynamic";

function fail(err) {
  const status = err?.status || 500;
  if (status >= 500) console.error("[shop/cart]", err);
  return NextResponse.json({ error: err?.message || "Cart error" }, { status });
}

export async function GET(req) {
  try {
    const owner = await getCartOwner();
    if (new URL(req.url).searchParams.get("count")) {
      return NextResponse.json({ count: await cartItemCount(owner) });
    }
    const { cart, items } = await fetchCartData(owner);
    return NextResponse.json({ cart, items, count: items.length });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req) {
  try {
    const { productId, quantity } = await req.json();
    const owner = await getCartOwner();
    const cartId = await addToCart(owner, productId, quantity);
    return NextResponse.json({ success: true, cartId });
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req) {
  try {
    const { itemId, quantity } = await req.json();
    await updateCartItem(await getCartOwner(), itemId, quantity);
    return NextResponse.json({ success: true });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(req) {
  try {
    const itemId = new URL(req.url).searchParams.get("itemId");
    await removeCartItem(await getCartOwner(), itemId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return fail(err);
  }
}
