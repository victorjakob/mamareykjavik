"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import SoldOutStamp from "../../admin/SoldOutStamp";
import ProductVideo from "./ProductVideo";

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

/**
 * Turn the single free-text `description` field into something the page can
 * lay out properly, without asking anyone to learn a markup language.
 *
 * The rules follow how we already write product copy:
 *   • blank lines separate blocks
 *   • a block of "Label: value" lines becomes the spec card
 *   • a short line on its own with no closing punctuation is a heading
 *     (and a heading sitting directly above a spec block — "Details" — is
 *     dropped, because the spec card carries its own title)
 *   • everything else is a paragraph, with its own line breaks kept
 *
 * A plain one-paragraph description still works: it just becomes the lead.
 */
function parseDescription(raw) {
  const text =
    typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
  if (!text) return { lead: null, body: [], specs: [] };

  const isSpecLine = (line) => /^[^:]{2,44}:\s*\S/.test(line);
  const isHeadingLine = (line) =>
    line.length <= 48 && !/[.!?,;:]$/.test(line) && !isSpecLine(line);

  const body = [];
  const specs = [];

  for (const chunk of text.split(/\n\s*\n/)) {
    const lines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!lines.length) continue;

    // If the block opens with a label line ("Details") and the rest are
    // spec lines, treat the whole thing as specs and drop the label.
    const candidate = isSpecLine(lines[0]) ? lines : lines.slice(1);
    if (candidate.length >= 2 && candidate.every(isSpecLine)) {
      // The label may also have been its own block just above.
      if (body.length && body[body.length - 1].type === "heading") body.pop();
      for (const line of candidate) {
        const at = line.indexOf(":");
        specs.push({
          label: line.slice(0, at).trim(),
          value: line.slice(at + 1).trim(),
        });
      }
      continue;
    }

    if (lines.length === 1 && isHeadingLine(lines[0])) {
      body.push({ type: "heading", text: lines[0] });
      continue;
    }

    body.push({ type: "paragraph", text: lines.join("\n") });
  }

  // The opening paragraph sits next to the price; the rest becomes the read.
  const lead =
    body.length && body[0].type === "paragraph" ? body.shift().text : null;

  // Never leave a heading stranded with nothing beneath it.
  while (body.length && body[body.length - 1].type === "heading") body.pop();

  return { lead, body, specs };
}

function Chevron({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M9.5 5.5 16 12l-6.5 6.5" />
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
  const [zoomed, setZoomed] = useState(false);
  // Natural width/height per image, measured on load, so the gallery frame
  // can take the shape of whatever was uploaded instead of cropping it.
  const [imageRatios, setImageRatios] = useState({});

  const detail = useMemo(
    () => parseDescription(product?.description),
    [product?.description]
  );

  // Lightbox: lock the page behind it and let Escape close it.
  useEffect(() => {
    if (!zoomed) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setZoomed(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [zoomed]);

  const translations = {
    en: {
      shopCrumb: "The Shop",
      separator: "·",
      quantity: "Quantity",
      addToCart: "Add to Basket",
      viewCart: "In Your Basket",
      buyNow: "Buy Now",
      description: "About this piece",
      details: "Details",
      watch: "Watch",
      videoTitle: "Product video",
      enlarge: "View larger",
      previous: "Previous image",
      next: "Next image",
      close: "Close",
      unavailable: "Image unavailable",
      notFound: "This piece has moved on.",
      addedToast: "Added to your basket",
      errorToast: "Could not add to basket",
      soldOut: "Sold out",
      soldOutBody:
        "This piece is currently unavailable. Wander the rest of the shop while we restock.",
    },
    is: {
      shopCrumb: "Verslunin",
      separator: "·",
      quantity: "Magn",
      addToCart: "Í körfuna",
      viewCart: "Í körfunni þinni",
      buyNow: "Kaupa núna",
      description: "Um þennan hlut",
      details: "Nánari upplýsingar",
      watch: "Horfa",
      videoTitle: "Myndband af vörunni",
      enlarge: "Sjá stærra",
      previous: "Fyrri mynd",
      next: "Næsta mynd",
      close: "Loka",
      unavailable: "Mynd ekki tiltæk",
      notFound: "Þessi hlutur hefur haldið áfram.",
      addedToast: "Bætt í körfuna",
      errorToast: "Ekki tókst að bæta í körfu",
      soldOut: "Uppselt",
      soldOutBody:
        "Þessi vara er ekki til staðar í augnablikinu. Skoðaðu aðra hluti í versluninni á meðan við fyllum á.",
    },
  };
  const t = translations[language];

  const handleAddToCart = async (goToCart = false) => {
    // Refuse to add a sold-out product to the basket. The buttons are
    // also disabled visually below — this is the second line of defence
    // in case anything bypasses the disabled state.
    if (product?.sold_out) {
      toast.error(t.soldOut);
      return;
    }
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

  const videos = Array.isArray(product.videos)
    ? product.videos.filter((url) => typeof url === "string" && url.trim())
    : [];
  const currentIndex = Math.max(0, allThumbnails.indexOf(displayImage));

  const step = (delta) => {
    if (allThumbnails.length < 2) return;
    const total = allThumbnails.length;
    setMainImage(allThumbnails[(currentIndex + delta + total) % total]);
  };

  // Shape the frame to the picture rather than the picture to the frame,
  // clamped either side of square so one very tall or very wide photo can't
  // throw the page out. Falls back to square until the image reports in.
  const naturalRatio = imageRatios[displayImage];
  const frameRatio = naturalRatio
    ? Math.min(Math.max(naturalRatio, 0.7), 1.5)
    : 1;

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    setImageRatios((prev) =>
      prev[displayImage]
        ? prev
        : { ...prev, [displayImage]: naturalWidth / naturalHeight }
    );
  };

  // The Details table is edited directly on the product. Products that have
  // nothing there fall back to the "Label: value" lines in the description,
  // which is how this table used to be built.
  const editedSpecs = Array.isArray(product.details)
    ? product.details.filter(
        (row) => row && ((row.label || "").trim() || (row.value || "").trim())
      )
    : [];
  const specs = editedSpecs.length > 0 ? editedSpecs : detail.specs;

  const hasSpecs = specs.length > 0;
  const hasBody = detail.body.length > 0;

  return (
    // overflow-x-clip rather than overflow-hidden: `hidden` turns <main>
    // into a scroll container, which silently kills the sticky buy panel and
    // the sticky spec card. `clip` still contains the blurred glows.
    <main className="relative overflow-x-clip text-[#2b1f15]">
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
      <section className="relative pt-14 md:pt-20 pb-14 md:pb-20">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start"
          >
            {/* Gallery column */}
            <div className="lg:col-span-7">
              {/* No mount or border: the frame is exactly the shape of the
                  photo, so the rounded corners belong to the image itself. The
                  background only shows for the moment before the image reports
                  its proportions, so it matches the page. */}
              <div
                className="group relative w-full overflow-hidden rounded-2xl bg-[#f7f1e7]"
                style={{
                  aspectRatio: String(frameRatio),
                  transition: "aspect-ratio 600ms cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                {displayImage ? (
                  <button
                    type="button"
                    onClick={() => setZoomed(true)}
                    aria-label={t.enlarge}
                    className="absolute inset-0 h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff914d]/50"
                  >
                    <Image
                      key={displayImage}
                      src={displayImage}
                      alt={product.name}
                      fill
                      onLoad={handleImageLoad}
                      className={`object-contain transition-transform duration-[900ms] ease-out group-hover:scale-[1.015] ${
                        product.sold_out ? "grayscale opacity-80" : ""
                      }`}
                      priority
                      sizes="(max-width: 1024px) 100vw, 58vw"
                    />
                  </button>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#8a7e72] font-light italic">
                    {t.unavailable}
                  </div>
                )}

                {product.sold_out && (
                  <SoldOutStamp size="lg" language={language} />
                )}

                {allThumbnails.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={t.previous}
                      className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#f7f1e7]/90 text-[#1a1410] opacity-0 shadow-[0_4px_18px_rgba(60,40,20,0.22)] backdrop-blur-sm transition-all duration-300 hover:bg-[#f7f1e7] focus:opacity-100 focus:outline-none group-hover:opacity-100 sm:left-4"
                    >
                      <Chevron className="h-5 w-5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={t.next}
                      className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#f7f1e7]/90 text-[#1a1410] opacity-0 shadow-[0_4px_18px_rgba(60,40,20,0.22)] backdrop-blur-sm transition-all duration-300 hover:bg-[#f7f1e7] focus:opacity-100 focus:outline-none group-hover:opacity-100 sm:right-4"
                    >
                      <Chevron className="h-5 w-5" />
                    </button>
                    <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-[#1a1410]/45 px-3.5 py-1.5 text-[10px] tracking-[0.2em] text-[#f0ebe3] backdrop-blur-sm">
                      {currentIndex + 1} / {allThumbnails.length}
                    </span>
                  </>
                )}
              </div>

              {allThumbnails.length > 1 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {allThumbnails.map((img, idx) => (
                    <button
                      key={img + idx}
                      type="button"
                      onClick={() => setMainImage(img)}
                      aria-label={`View image ${idx + 1}`}
                      className={`relative h-20 w-20 overflow-hidden rounded-xl bg-[#f7f1e7] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff914d]/50 ${
                        displayImage === img
                          ? "ring-1 ring-[#7a5a3a] ring-offset-2 ring-offset-[#f7f1e7]"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Product image ${idx + 1}`}
                        fill
                        className="object-contain"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Optional videos, in the order they were added. A clip the
                  browser can't play renders nothing at all. */}
              {videos.length > 0 && (
                <div className="mt-5 space-y-4">
                  {videos.map((url, idx) => (
                    <ProductVideo
                      key={`${url}-${idx}`}
                      url={url}
                      poster={displayImage}
                      label={t.watch}
                      title={
                        videos.length > 1
                          ? `${product.name} — ${t.videoTitle} ${idx + 1}`
                          : `${product.name} — ${t.videoTitle}`
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Buy column — sticks alongside the gallery on desktop */}
            <div className="lg:col-span-5 lg:pl-4 lg:sticky lg:top-24 lg:self-start">
              <h1
                className="font-serif italic text-[#1a1410] leading-[1.02] mb-5"
                style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)" }}
              >
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 pb-7 border-b border-[#b8935a]/25">
                <p
                  className="font-serif italic text-[#7a5a3a]"
                  style={{ fontSize: "clamp(1.5rem, 2vw, 1.85rem)" }}
                >
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Lead paragraph — the rest of the copy lives further down */}
              {detail.lead && (
                <p className="mt-7 text-[15px] leading-[1.8] font-light text-[#5b4a3a] whitespace-pre-line">
                  {detail.lead}
                </p>
              )}

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

                {product.sold_out ? (
                  // Sold out: a single, calm, locked-out CTA replaces both
                  // buttons. Reads better than two greyed-out buttons next
                  // to each other.
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled
                      aria-disabled
                      className="w-full px-7 py-4 rounded-full bg-[#1a1410]/15 border border-[#1a1410]/25 text-[#1a1410]/70 text-[11px] uppercase tracking-[0.25em] font-light cursor-not-allowed"
                    >
                      {t.soldOut}
                    </button>
                    <p className="text-[12px] text-[#6b5a48] font-light italic leading-relaxed">
                      {t.soldOutBody}
                    </p>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === THE LONG READ - description and the Details table === */}
      {(hasBody || hasSpecs) && (
        <section className="relative border-t border-[#b8935a]/25 py-16 md:py-24">
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {hasBody && (
                <div
                  className={hasSpecs ? "lg:col-span-7" : "lg:col-span-8 lg:col-start-3"}
                >
                  <div className="flex items-center gap-3 mb-7">
                    <span className="h-px w-6 bg-[#b8935a]/60" />
                    <h2 className="text-[10px] uppercase tracking-[0.35em] text-[#b8935a]">
                      {t.description}
                    </h2>
                  </div>

                  <div className="max-w-[62ch]">
                    {detail.body.map((block, idx) =>
                      block.type === "heading" ? (
                        <h3
                          key={`h-${idx}`}
                          className="font-serif italic text-[#1a1410] mt-11 first:mt-0 mb-4"
                          style={{ fontSize: "clamp(1.3rem, 1.7vw, 1.6rem)" }}
                        >
                          {block.text}
                        </h3>
                      ) : (
                        <p
                          key={`p-${idx}`}
                          className="text-[16px] leading-[1.9] font-light text-[#5b4a3a] whitespace-pre-line mt-5 first:mt-0"
                        >
                          {block.text}
                        </p>
                      )
                    )}
                  </div>
                </div>
              )}

              {hasSpecs && (
                <aside
                  className={hasBody ? "lg:col-span-5" : "lg:col-span-8 lg:col-start-3"}
                >
                  <div className="rounded-sm border border-[#b8935a]/30 bg-[#f2ead9] px-6 py-6 sm:px-7 lg:sticky lg:top-24">
                    <h3 className="text-[10px] uppercase tracking-[0.35em] text-[#b8935a] mb-4">
                      {t.details}
                    </h3>
                    <dl className="divide-y divide-[#b8935a]/20">
                      {specs.map((spec, idx) => (
                        <div
                          key={`${spec.label}-${idx}`}
                          className="grid grid-cols-1 gap-x-5 gap-y-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,8rem)_1fr]"
                        >
                          <dt className="text-[10px] uppercase tracking-[0.18em] text-[#9b8464] leading-[1.5] sm:pt-[5px]">
                            {spec.label}
                          </dt>
                          <dd className="text-[14.5px] font-light text-[#3f3124] leading-[1.6] whitespace-pre-line">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </section>
      )}


      {/* ═══ Image lightbox ═══ */}
      <AnimatePresence>
        {/* z-[10000]: the lightbox has to clear the fixed navbar (z-210) and
            the contact launcher (z-9999), or they float on top of it. */}
        {zoomed && displayImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[10000] bg-[#120d09]/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            onClick={() => setZoomed(false)}
          >
            <button
              type="button"
              onClick={() => setZoomed(false)}
              className="absolute top-6 right-6 z-10 rounded-full border border-[#f0ebe3]/25 px-5 py-2.5 text-[10px] uppercase tracking-[0.3em] text-[#f0ebe3] hover:border-[#ff914d] hover:text-[#ff914d] transition-colors"
            >
              {t.close}
            </button>
            <div className="relative h-full w-full p-6 sm:p-12">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
