"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PropagateLoader } from "react-spinners";
import { NumericFormat } from "react-number-format";
import { toast } from "react-hot-toast";
import { supabase } from "../../../../util/supabase/client";
import { useSession } from "next-auth/react";
import { useCart } from "@/providers/CartProvider";
import { getGuestId } from "@/util/guest-util";
import { formatPrice } from "@/util/IskFormat";

export default function ListSingleProduct({ initialProduct }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { refreshCartStatus } = useCart();
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [mainImage, setMainImage] = useState(product.image);

  const handleAddToCart = async () => {
    if (isInCart) {
      router.push("/shop/cart");
      return;
    }

    try {
      setIsAddingToCart(true);

      const isLoggedIn = !!session?.user;
      const guestId = getGuestId();
      const cartQuery = {
        status: "pending",
        ...(isLoggedIn ? { email: session.user.email } : { guest_id: guestId }),
      };

      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id, price")
        .match(cartQuery)
        .maybeSingle();
      if (cartError) throw cartError;

      let cartId;
      let currentPrice = 0;

      if (!cart) {
        const { data: newCart, error } = await supabase
          .from("carts")
          .insert({
            ...(isLoggedIn
              ? { email: session.user.email }
              : { guest_id: guestId }),
            status: "pending",
            price: 0,
          })
          .select()
          .single();

        if (error) throw error;
        cartId = newCart.id;
      } else {
        cartId = cart.id;
        currentPrice = cart.price || 0;
      }

      const itemPrice = product.price * quantity;

      await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: product.id,
        quantity,
        price: itemPrice,
      });

      await supabase
        .from("carts")
        .update({ price: currentPrice + itemPrice })
        .eq("id", cartId);

      await refreshCartStatus();
      setIsInCart(true);
      toast.success("Added to cart");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Parse images if needed
  let extraImages = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      extraImages = product.images;
    } else if (typeof product.images === "string") {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) extraImages = parsed;
      } catch (e) {
        // Not a valid JSON array, ignore
      }
    }
  }

  // Compose thumbnails: main image first, then extras (no duplicates)
  const allThumbnails = [
    product.image,
    ...extraImages.filter((img) => img !== product.image),
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-xl bg-yellow-50 p-6 text-center">
        <p className="text-yellow-600 font-medium">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="lg:grid lg:grid-cols-2">
          <div className="relative h-[500px] lg:h-[700px] p-8">
            <div className="relative h-full w-full rounded-xl overflow-hidden shadow-lg">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Extra Images Thumbnails */}
            {allThumbnails.length > 0 && (
              <div className="flex gap-2 mt-4 justify-center">
                {allThumbnails.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img
                        ? "border-emerald-500"
                        : "border-gray-200"
                    } hover:border-emerald-400`}
                    onClick={() => setMainImage(img)}
                    tabIndex={0}
                    aria-label={`Show image ${idx + 1}`}
                  >
                    <Image
                      src={img}
                      alt={`Product image ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-8 lg:p-12 flex flex-col">
            <div className="flex-grow">
              <div className="border-b border-gray-100 pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-xl text-emerald-600">
                  {formatPrice(product.price)}
                </p>
              </div>

              <div className="py-8 space-y-8">
                <div>
                  <label className="text-sm text-gray-600">Quantity </label>
                  <div className="mt-2 inline-flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
                    >
                      −
                    </button>
                    <NumericFormat
                      value={quantity}
                      onValueChange={({ floatValue }) =>
                        setQuantity(Math.max(1, Math.min(99, floatValue || 1)))
                      }
                      className="w-16 h-10 text-center border-x border-gray-200 focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-medium
                      hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50"
                  >
                    {isInCart ? "View Cart" : "Add to Cart"}
                  </button>
                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={isAddingToCart}
                    className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl font-medium
                      hover:bg-emerald-50 transition-all disabled:opacity-50"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
