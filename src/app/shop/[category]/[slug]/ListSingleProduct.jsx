"use client";

import { useState } from "react";
import Link from "next/link";
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
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const EASE = [0.22, 1, 0.36, 1];

function Ornament({ width = 60, className = "text-[#b8935a]" }) {
  return (
    <svg
      width={width}
      height="10"
      viewBox="0 0 60 10"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 5 Q 12 1 20 5 T 38 5"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
      <circle cx="30" cy="5" r="1.2" fill="currentColor" />
      <path
        d="M40 5 Q 48 1 58 5"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ListSingleProduct({ initialProduct }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { refreshCartStatus } = useCart();
  const { language } = useLanguage();
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [mainImage, setMainImage] = useState(initialProduct?.image || "");

  const translations = {
    en: {
      shopCrumb: "The Shop",
      separator: "·",
      eyebrow: "A Piece of Mama",
      quantity: "Quantity",
      addToCart: "Add to Basket",
      viewCart: "In Your Basket",
      buyNow: "Buy Now",
      description: "About this piece",
      ritualTitle: "How we think about it",
      ritualBody:
        "Everything here is made in small rhythms — tried at the Mama table first, then shared if it feels like it belongs. Handle it gently. Let it do its small work.",
      care: "Care",
      careBody: "Keep dry, keep close. Use often.",
      origin: "Origin",
      originBody: "Made or sourced with care in small batches.",
      shipping: "Shipping",
      shippingBody: "Ready in a few days. Pickup always welcome.",
      unavailable: "Image unavailable",
      notFound: "This piece has moved on.",
      addedToast: "Added to your basket",
      errorToast: "Could not add to basket",
    },
    is: {
      shopCrumb: "Verslunin",
      separator: "·",
      eyebrow: "Bútur af Mama",
      quantity: "Magn",
      addToCart: "Í körfuna",
      viewCart: "Í körfunni þinni",
      buyNow: "Kaupa núna",
      description: "Um þennan hlut",
      ritualTitle: "Hvernig við hugsum um það",
      ritualBody:
        "Allt hér er búið til í smáum takti — prófað á borði Mama fyrst, svo deilt ef það á heima. Farðu mildum höndum um það. Leyfðu því að vinna sína litlu vinnu.",
      care: "Umhirða",
      careBody: "Hafðu þurrt, hafðu nálægt. Notaðu oft.",
      origin: "Uppruni",
      originBody: "Gert eða valið með natni í smáum skömmtum.",
      shipping: "Sending",
      shippingBody: "Tilbúið á fáum dögum. Þú getur alltaf sótt.",
      unavailable: "Mynd ekki tiltæk",
      notFound: "Þessi hlutur hefur haldið áfram.",
      addedToast: "Bætt í körfuna",
      errorToast: "Ekki tókst að bæta í körfu",
    },
  };
  const t = translations[language];

  const handleAddToCart = async (goToCart = false) => {
    if (isInCart) {
      if (goToCart) router.push("/shop/cart");
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
      toast.success(t.addedToast);
      if (goToCart) router.push("/shop/cart");
    } catch (err) {
      console.error("Error:", err);
      toast.error(t.errorToast);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PropagateLoader color="#ff914d" size={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-32 text-center px-6">
        <p className="text-[#6b5a48] font-light italic">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto mt-32 text-center px-6">
        <Ornament width={80} className="text-[#b8935a] mx-auto block" />
        <p className="mt-6 font-serif italic text-[#1a1410] text-2xl">
          {t.notFound}
        </p>
      </div>
    );
  }

  // Parse extra images
  let extraImages = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      extraImages = product.images;
    } else if (typeof product.images === "string") {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) extraImages = parsed;
      } catch (e) {
        // ignore
      }
    }
  }

  const allThumbnails = [
    product.image,
    ...extraImages.filter((img) => img !== product.image),
  ];

  const displayImage = mainImage || allThumbnails[0] || "";

  return (
    <main className="relative overflow-hidden text-[#2b1f15]">
      {/* ═══ Dark top band — keeps navbar legible ═══ */}
      <section
        className="relative overflow-hidden bg-[#1a1410] text-[#f0ebe3] pt-28 md:pt-36 pb-10 md:pb-14"
        data-navbar-theme="dark"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[360px] w-[80vw] max-w-[900px] rounded-full bg-[#ff914d] opacity-[0.05] blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.35em] text-[#c9b89e]"
            aria-label="Breadcrumb"
          >
            <Link
              href="/shop"
              className="hover:text-[#ff914d] transition-colors"
            >
              {t.shopCrumb}
            </Link>
            <span className="text-[#c9b89e]/50">{t.separator}</span>
            <span className="text-[#ff914d]">{product.name}</span>
          </motion.nav>
        </div>
      </section>

      {/* Paper texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ═══ TOP SPREAD ═══ */}
      <section className="relative pt-14 md:pt-20 pb-16 md:pb-24">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start"
          >
            {/* Image column */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/5] lg:aspect-[5/6] w-full overflow-hidden bg-[#ede4d1] rounded-sm">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#8a7e72] font-light italic">
                    {t.unavailable}
                  </div>
                )}
              </div>

              {allThumbnails.length > 1 && (
                <div className="flex gap-3 mt-5 flex-wrap">
                  {allThumbnails.map((img, idx) => (
                    <button
                      key={img + idx}
                      type="button"
                      className={`relative w-16 h-20 overflow-hidden rounded-sm transition-all duration-300 ${
                        mainImage === img
                          ? "ring-1 ring-[#7a5a3a] ring-offset-2 ring-offset-[#f7f1e7]"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => setMainImage(img)}
                      aria-label={`View image ${idx + 1}`}
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

            {/* Info column */}
            <div className="lg:col-span-5 lg:pl-4 lg:pt-4">
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-[#b8935a]/60" />
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#b8935a]">
                  {t.eyebrow}
                </span>
              </div>

              <h1
                className="font-serif italic text-[#1a1410] leading-[1.02] mb-5"
                style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)" }}
              >
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 pb-8 border-b border-[#b8935a]/25">
                <p
                  className="font-serif italic text-[#7a5a3a]"
                  style={{ fontSize: "clamp(1.5rem, 2vw, 1.85rem)" }}
                >
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Quantity + CTAs */}
              <div className="mt-8 space-y-7">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.35em] text-[#b8935a] mb-3">
                    {t.quantity}
                  </label>
                  <div className="inline-flex items-center border-b border-[#1a1410]/30 bg-transparent">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-11 flex items-center justify-center text-[#6b5a48] hover:text-[#1a1410] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <NumericFormat
                      value={quantity}
                      onValueChange={({ floatValue }) =>
                        setQuantity(Math.max(1, Math.min(99, floatValue || 1)))
                      }
                      className="w-12 h-11 bg-transparent text-center text-[#1a1410] font-serif italic focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="w-10 h-11 flex items-center justify-center text-[#6b5a48] hover:text-[#1a1410] transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    type="button"
                    onClick={() => {
                      if (isInCart) {
                        router.push("/shop/cart");
                      } else {
                        handleAddToCart(false);
                      }
                    }}
                    disabled={isAddingToCart}
                    className={`relative flex-1 px-7 py-4 rounded-full text-[11px] uppercase tracking-[0.25em] font-light transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff914d]/40 disabled:opacity-60 ${
                      isInCart
                        ? "bg-transparent border border-[#1a1410]/40 text-[#1a1410] hover:border-[#7a5a3a] hover:text-[#7a5a3a]"
                        : "bg-[#1a1410] text-[#f7f1e7] hover:bg-[#2b1f15]"
                    }`}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={isInCart ? "incart" : "notincart"}
                        initial={{ y: 6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -6, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {isInCart ? t.viewCart : t.addToCart}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                  <motion.button
                    onClick={() => handleAddToCart(true)}
                    disabled={isAddingToCart}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-7 py-4 rounded-full bg-[#ff914d] text-[#1a1410] text-[11px] uppercase tracking-[0.25em] font-light hover:bg-[#ff7a28] transition-all duration-300 disabled:opacity-60"
                  >
                    {t.buyNow}
                  </motion.button>
                </div>
              </div>

              {/* Short description */}
              {product.description && (
                <div className="mt-10 pt-8 border-t border-[#b8935a]/25">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-6 bg-[#b8935a]/60" />
                    <h3 className="text-[10px] uppercase tracking-[0.35em] text-[#b8935a]">
                      {t.description}
                    </h3>
                  </div>
                  <p className="text-[#6b5a48] font-light leading-[1.85] whitespace-pre-line text-[15px]">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Tiny facts row */}
              <div className="mt-10 grid grid-cols-3 gap-5 pt-8 border-t border-[#b8935a]/25">
                {[
                  { label: t.care, body: t.careBody },
                  { label: t.origin, body: t.originBody },
                  { label: t.shipping, body: t.shippingBody },
                ].map((fact) => (
                  <div key={fact.label}>
                    <div className="text-[9px] uppercase tracking-[0.35em] text-[#b8935a] mb-2">
                      {fact.label}
                    </div>
                    <p className="text-[12px] text-[#6b5a48] font-light leading-[1.65]">
                      {fact.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ RITUAL NARRATIVE ═══ */}
      <section className="relative py-24 md:py-32 bg-[#1a1410] text-[#f0ebe3]" data-navbar-theme="dark">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/4 h-[360px] w-[360px] rounded-full bg-[#ff914d] opacity-[0.05] blur-[140px]"
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#ff914d]/60" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]">
              {t.ritualTitle}
            </span>
            <span className="h-px w-10 bg-[#ff914d]/60" />
          </div>
          <p
            className="font-serif italic text-[#f0ebe3] leading-[1.4]"
            style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)" }}
          >
            &ldquo; {t.ritualBody} &rdquo;
          </p>
          <div className="flex justify-center mt-10">
            <Ornament width={80} className="text-[#ff914d]/70" />
          </div>
        </div>
      </section>
    </main>
  );
}
