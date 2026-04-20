"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import Checkout from "./Checkout";
import { CartService } from "@/util/cart-util";
import { useCart } from "@/providers/CartProvider";
import { useLanguage } from "@/hooks/useLanguage";

function Ornament({ width = 70, className = "text-[#b8935a]" }) {
  return (
    <svg
      width={width}
      height="12"
      viewBox="0 0 80 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 6 Q 14 1 24 6 T 44 6 T 64 6"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <circle cx="40" cy="6" r="1.4" fill="currentColor" />
      <path
        d="M64 6 Q 70 2 78 6"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Master({ initialCart, initialItems, user }) {
  const { language } = useLanguage();
  const [cartItems, setCartItems] = useState(initialItems);
  const [cartTotal, setCartTotal] = useState(
    CartService.calculateTotal(initialItems)
  );
  const router = useRouter();
  const { refreshCartStatus } = useCart();

  const translations = {
    en: {
      crumb: "The Shop",
      separator: "·",
      basket: "The Basket",
      emptyTitle: "Your basket is quiet.",
      emptyLede:
        "Nothing gathered just yet. Step back into the shop and find something to carry home.",
      continueShopping: "Back to the Shop",
      yourBasket: "Your Basket",
      items: "pieces",
      item: "piece",
      keepShopping: "Keep Looking",
    },
    is: {
      crumb: "Verslunin",
      separator: "·",
      basket: "Karfan",
      emptyTitle: "Karfan er kyrrlát.",
      emptyLede:
        "Ekkert safnað í bili. Farðu aftur í verslunina og finndu eitthvað til að bera heim.",
      continueShopping: "Aftur í verslun",
      yourBasket: "Karfan þín",
      items: "hlutir",
      item: "hlutur",
      keepShopping: "Halda áfram að leita",
    },
  };

  const t = translations[language];

  const handleCartUpdate = async (newItems) => {
    setCartItems(newItems);
    setCartTotal(CartService.calculateTotal(newItems));
    refreshCartStatus();
  };

  const handleRemoveItem = async (itemId) => {
    await CartService.removeItem(itemId);
    const updatedItems = cartItems.filter((item) => item.id !== itemId);
    await handleCartUpdate(updatedItems);
  };

  const handleUpdateQuantity = async (itemId, newQty) => {
    await CartService.updateItemQuantity(itemId, newQty);
    const updatedItems = cartItems
      .map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
      .filter((item) => item.quantity > 0);
    await handleCartUpdate(updatedItems);
  };

  // Paper texture
  const paperTexture = (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );

  // Dark band with breadcrumb — keeps navbar legible on cream shop pages
  const darkBand = (
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
        <nav
          className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.35em] text-[#c9b89e]"
          aria-label="Breadcrumb"
        >
          <Link href="/shop" className="hover:text-[#ff914d] transition-colors">
            {t.crumb}
          </Link>
          <span className="text-[#c9b89e]/50">{t.separator}</span>
          <span className="text-[#ff914d]">{t.basket}</span>
        </nav>
      </div>
    </section>
  );

  if (!initialCart || cartItems.length === 0) {
    return (
      <main className="relative overflow-hidden text-[#2b1f15] pb-32">
        {darkBand}
        {paperTexture}
        <div className="relative max-w-2xl mx-auto px-6 text-center pt-16 md:pt-24 pb-12">
          <Ornament width={80} className="text-[#b8935a] mx-auto block" />
          <h2
            className="mt-8 font-serif italic text-[#1a1410] leading-[1.05]"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)" }}
          >
            {t.emptyTitle}
          </h2>
          <p className="mt-6 max-w-md mx-auto text-[#6b5a48] font-light italic leading-[1.8]">
            {t.emptyLede}
          </p>
          <button
            onClick={() => router.push("/shop")}
            className="group mt-10 inline-flex items-center gap-3 text-[#1a1410] hover:text-[#7a5a3a] transition-colors"
          >
            <span className="text-[11px] uppercase tracking-[0.3em]">
              {t.continueShopping}
            </span>
            <span className="h-px w-10 bg-[#1a1410] transition-all duration-500 group-hover:w-16 group-hover:bg-[#7a5a3a]" />
            <svg
              width="14"
              height="10"
              viewBox="0 0 14 10"
              fill="none"
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M1 5h12M9 1l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden text-[#2b1f15] pb-24">
      {darkBand}
      {paperTexture}

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-12 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-10 lg:gap-16">
          {/* Left — invoice list */}
          <section>
            <header className="flex items-end justify-between pb-6 border-b-2 border-[#1a1410]/80">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px w-8 bg-[#b8935a]/60" />
                  <span className="text-[10px] uppercase tracking-[0.35em] text-[#b8935a]">
                    {t.yourBasket}
                  </span>
                </div>
                <h1
                  className="font-serif italic text-[#1a1410] leading-[1.02]"
                  style={{ fontSize: "clamp(2rem, 3.6vw, 2.8rem)" }}
                >
                  {cartItems.length}{" "}
                  {cartItems.length === 1 ? t.item : t.items}
                </h1>
              </div>
              <Link
                href="/shop"
                className="hidden md:inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#6b5a48] hover:text-[#1a1410] transition-colors"
              >
                <span>{t.keepShopping}</span>
                <span className="text-base">+</span>
              </Link>
            </header>

            <div className="mt-2 divide-y divide-[#b8935a]/25">
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
          </section>

          {/* Right — checkout */}
          <aside className="lg:sticky lg:top-8 self-start">
            <Checkout
              cartTotal={cartTotal}
              cartItems={cartItems}
              user={user}
              cartId={initialCart.id}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
