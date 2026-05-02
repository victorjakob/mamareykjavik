"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/util/IskFormat";
import { AdminProvider } from "./admin/AdminContext";
import AdminBar from "./admin/AdminBar";
import AdminProductOverlay, {
  AdminProductBadges,
} from "./admin/AdminProductOverlay";
import AdminCategoryOverlay from "./admin/AdminCategoryOverlay";
import { SortableList, SortableItem } from "./admin/Sortable";
import SoldOutStamp from "./admin/SoldOutStamp";

const EASE = [0.22, 1, 0.36, 1];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// ── Small ornamental divider ──
function Ornament({ className = "text-[#b8935a]", width = 80 }) {
  return (
    <svg
      width={width}
      height="14"
      viewBox="0 0 80 14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 7 Q 14 1 24 7 T 44 7 T 64 7"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <circle cx="40" cy="7" r="1.6" fill="currentColor" />
      <circle cx="6" cy="7" r="0.8" fill="currentColor" />
      <circle cx="74" cy="7" r="0.8" fill="currentColor" />
      <path
        d="M64 7 Q 70 3 78 7"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Paper texture overlay (very subtle) ──
function PaperTexture() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

const ListCategories = ({ categories: initialCategories, isAdmin = false }) => {
  const router = useRouter();
  const { language } = useLanguage();
  const [activeIdx, setActiveIdx] = useState(0);
  const [clickedProduct, setClickedProduct] = useState(null);

  // Local stateful copy so admin reorders / inline mutations show up
  // immediately. Re-syncs whenever the server data changes (router.refresh).
  const [categoriesState, setCategoriesState] = useState(initialCategories);
  useEffect(() => {
    setCategoriesState(initialCategories);
  }, [initialCategories]);
  const categories = categoriesState;

  const translations = {
    en: {
      est: "Est. Reykjavík",
      heroLine1: "A small shop of",
      heroLine2: "well-made things.",
      heroLede:
        "Pieces from our kitchen, our ceremonies, and our long, candle-lit nights. Small-batch by nature — chosen with care.",
      chaptersLabel: "The Chapters",
      shopHome: "Shop",
      pieces: "pieces",
      piece: "piece",
      emptyTitle: "This shelf is resting.",
      emptyBody:
        "Nothing to pour today. Wander a different chapter while we restock.",
      open: "Open",
      ourValues: "Three notes that run through every piece",
      valueOne: "Earth",
      valueOneBody:
        "Plant-based, thoughtfully sourced. Ingredients we can trace back to the soil.",
      valueTwo: "Craft",
      valueTwoBody:
        "Made in small batches, mostly by hand, often at the restaurant itself.",
      valueThree: "Community",
      valueThreeBody:
        "Proceeds feed the table — the events, the workshops, the people we gather.",
      whisper: "From the Mama table, with love.",
      giftCardCta: "Visit the Gift Card page",
      giftCardBlurb:
        "A small envelope of Mama — stews, cacao, ceremonies, candlelit dinners. Send it to someone you love.",
    },
    is: {
      est: "Stofnað í Reykjavík",
      heroLine1: "Lítil verslun af",
      heroLine2: "vönduðum hlutum.",
      heroLede:
        "Brot úr eldhúsinu okkar, athöfnunum og löngu kertakvöldunum. Smáframleidd af eðli — valin með ást.",
      chaptersLabel: "Kaflarnir",
      shopHome: "Verslun",
      pieces: "hlutir",
      piece: "hlutur",
      emptyTitle: "Þessi hilla er í hvíld.",
      emptyBody:
        "Ekkert að hella í dag. Skoðaðu annan kafla meðan við fyllum á.",
      open: "Opna",
      ourValues: "Þrír tónar sem hljóma í gegn um allt sem við gerum",
      valueOne: "Jörð",
      valueOneBody:
        "Jurtaríkt, valið með hugsun. Hráefni sem við getum rakið aftur í moldina.",
      valueTwo: "Handverk",
      valueTwoBody:
        "Búið til í smáum skömmtum, oftast með höndunum, oft á veitingastaðnum sjálfum.",
      valueThree: "Samfélag",
      valueThreeBody:
        "Tekjurnar næra borðið — viðburðina, smiðjurnar, fólkið sem við söfnum saman.",
      whisper: "Frá borði Mama, með ást.",
      giftCardCta: "Farðu á Gjafakortasíðuna",
      giftCardBlurb:
        "Lítill umslag af Mama — súpur, kakó, athafnir, kertakvöld. Sendu það til einhvers sem þú elskar.",
    },
  };

  const t = translations[language];
  const active = categories[activeIdx];
  const products = useMemo(() => active?.products || [], [active]);

  const handleProductClick = (product) => {
    setClickedProduct(product.id);
    requestAnimationFrame(() => {
      router.push(`/shop/${active.slug}/${product.slug}`);
    });
  };

  // ── Admin: optimistic reorder + persist ───────────────────────────
  const persistCategoryOrder = (next) => {
    // Drop the giftcard pseudo-row, send only real categories
    const items = next
      .filter((c) => !c?._isGiftCard)
      .map((c, idx) => ({ id: c.id, order: idx + 1 }));
    fetch("/api/admin/store/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).catch((err) => console.error("category reorder failed", err));
  };

  // Local state is already updated by SortableList's setItems prop; this
  // just persists the new order to the server.
  const persistProductOrder = (next) => {
    const items = next.map((p, idx) => ({ id: p.id, order: idx + 1 }));
    fetch("/api/admin/store/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).catch((err) => console.error("product reorder failed", err));
  };

  const updateProductInState = (next) => {
    setCategoriesState((prev) =>
      prev.map((c) =>
        c.id === active?.id
          ? {
              ...c,
              products: c.products.map((p) =>
                p.id === next.id ? next : p
              ),
            }
          : c
      )
    );
  };

  const updateCategoryInState = (next) => {
    setCategoriesState((prev) =>
      prev.map((c) => (c.id === next.id ? { ...c, ...next } : c))
    );
  };

  // Render-prop helper so the same JSX works inside / outside AdminProvider
  const Wrapper = ({ children }) =>
    isAdmin ? (
      <AdminProvider>
        <AdminBar />
        {children}
      </AdminProvider>
    ) : (
      <>{children}</>
    );

  return (
    <Wrapper>
    <main className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          DARK HERO BANNER — holds the navbar in safe dark territory
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-[#1a1410] text-[#f0ebe3]"
        data-navbar-theme="dark"
      >
        {/* ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[520px] w-[90vw] max-w-[1100px] rounded-full bg-[#ff914d] opacity-[0.06] blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 -right-32 h-[420px] w-[420px] rounded-full bg-[#c9b89e] opacity-[0.04] blur-[140px]"
        />

        {/* subtle grain */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-36 md:pt-44 pb-14 md:pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="flex items-center justify-center gap-4 mb-7">
              <span className="h-px w-10 bg-[#ff914d]/50" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-[#ff914d] font-light">
                {t.est} · MMXX
              </span>
              <span className="h-px w-10 bg-[#ff914d]/50" />
            </div>

            <h1
              className="font-serif text-[#f0ebe3] leading-[0.96] tracking-[-0.01em]"
              style={{ fontSize: "clamp(2.4rem, 7.8vw, 5.6rem)" }}
            >
              {t.heroLine1}
              <br />
              <em className="italic text-[#ff914d]/90">{t.heroLine2}</em>
            </h1>

            <div className="flex justify-center mt-8">
              <Ornament width={90} className="text-[#ff914d]/70" />
            </div>

            <p
              className="mx-auto mt-7 max-w-2xl text-[#c4b8aa] font-light leading-[1.8] italic"
              style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)" }}
            >
              {t.heroLede}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CREAM PAPER — TABS + PRODUCTS
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative bg-[#f7f1e7] text-[#2b1f15] overflow-hidden"
        data-navbar-theme="light"
      >
        <PaperTexture />
        <div
          aria-hidden
          className="pointer-events-none absolute top-40 left-1/2 -translate-x-1/2 w-[80vw] max-w-[900px] h-[420px] rounded-full bg-[#ff914d]/[0.045] blur-[130px]"
        />

        {/* Sticky tabs bar (sits just under the dark banner) */}
        <div className="relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="pt-14 pb-2 text-center">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#b8935a]">
                {t.chaptersLabel}
              </span>
            </div>

            <nav
              aria-label="Shop chapters"
              className="relative mt-6 mb-4 flex items-stretch justify-center gap-0 md:gap-2 flex-wrap"
            >
              {(() => {
                const renderTab = (cat, idx, dragHandleProps) => {
                  const num =
                    idx < ROMAN.length ? ROMAN[idx] : String(idx + 1);
                  const isActive = idx === activeIdx;
                  const handleTabClick = () => {
                    if (cat?._isGiftCard) {
                      router.push("/giftcard");
                      return;
                    }
                    setActiveIdx(idx);
                  };
                  return (
                    <div
                      key={cat.id}
                      className="relative inline-flex flex-col items-center"
                    >
                      <button
                        type="button"
                        onClick={handleTabClick}
                        aria-pressed={isActive}
                        className={`group relative px-5 md:px-8 py-4 flex flex-col items-center text-center focus:outline-none ${
                          cat.is_hidden ? "opacity-50" : ""
                        }`}
                      >
                        <span
                          className={`font-serif italic leading-none transition-colors duration-300 ${
                            isActive
                              ? "text-[#7a5a3a]"
                              : "text-[#b8935a]/70 group-hover:text-[#7a5a3a]"
                          }`}
                          style={{ fontSize: "clamp(1.7rem, 2.6vw, 2.2rem)" }}
                        >
                          {num}
                        </span>
                        <span
                          className={`mt-2 text-[10px] md:text-[11px] uppercase tracking-[0.32em] transition-colors duration-300 capitalize ${
                            isActive
                              ? "text-[#1a1410]"
                              : "text-[#6b5a48]/70 group-hover:text-[#1a1410]"
                          }`}
                        >
                          {cat.name}
                          {cat.is_hidden && (
                            <span className="ml-1 text-[#b8935a]">
                              · hidden
                            </span>
                          )}
                        </span>
                        <span
                          className={`mt-3 block h-px transition-all duration-500 ${
                            isActive
                              ? "w-12 bg-[#7a5a3a]"
                              : "w-4 bg-[#b8935a]/40 group-hover:w-8 group-hover:bg-[#7a5a3a]/70"
                          }`}
                        />
                      </button>
                      {isAdmin && (
                        <div className="mt-1">
                          <AdminCategoryOverlay
                            category={cat}
                            dragHandleProps={dragHandleProps}
                            onChange={updateCategoryInState}
                          />
                        </div>
                      )}
                    </div>
                  );
                };

                if (!isAdmin) {
                  return categories.map((cat, idx) => renderTab(cat, idx));
                }

                // Admin: real categories are sortable; the giftcard pseudo
                // tab is appended at the end and is not draggable.
                const realCats = categories.filter((c) => !c?._isGiftCard);
                const giftCat = categories.find((c) => c?._isGiftCard);
                return (
                  <>
                    <SortableList
                      items={realCats}
                      setItems={(next) =>
                        setCategoriesState(
                          giftCat ? [...next, giftCat] : next
                        )
                      }
                      onPersist={persistCategoryOrder}
                      strategy="horizontal"
                      idKey="id"
                    >
                      {(cat) => {
                        const idx = categories.findIndex(
                          (c) => c.id === cat.id
                        );
                        return (
                          <SortableItem key={cat.id} id={cat.id}>
                            {({ handleProps }) =>
                              renderTab(cat, idx, handleProps)
                            }
                          </SortableItem>
                        );
                      }}
                    </SortableList>
                    {giftCat &&
                      renderTab(
                        giftCat,
                        categories.findIndex((c) => c?._isGiftCard)
                      )}
                  </>
                );
              })()}
            </nav>
          </div>
        </div>

        {/* Active chapter pane */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-10 md:pt-14 pb-28 md:pb-36">
          <AnimatePresence mode="wait">
            <motion.div
              key={active?.id || "empty"}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              {/* Chapter header */}
              <header className="text-center mb-12 md:mb-16">
                <nav
                  aria-label="Breadcrumb"
                  className="mb-6 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.35em] text-[#b8935a]"
                >
                  <span className="text-[#7a5a3a]/70">{t.shopHome}</span>
                  <span className="text-[#b8935a]/50">/</span>
                  <span className="text-[#7a5a3a] font-light capitalize">
                    {active?.name}
                  </span>
                </nav>
                <h2
                  className="font-serif italic text-[#1a1410] leading-[1.02] capitalize"
                  style={{ fontSize: "clamp(2rem, 4.2vw, 3.4rem)" }}
                >
                  {active?.name}
                </h2>
                <div className="mt-6 flex justify-center">
                  <Ornament width={70} />
                </div>
                {active?.description && !active?._isGiftCard && (
                  <p className="mx-auto mt-6 max-w-xl text-[#6b5a48] font-light italic leading-[1.8] text-sm md:text-base">
                    {active.description}
                  </p>
                )}
                {active?._isGiftCard && (
                  <p className="mx-auto mt-6 max-w-xl text-[#6b5a48] font-light italic leading-[1.8] text-sm md:text-base">
                    {t.giftCardBlurb}
                  </p>
                )}
                {!active?._isGiftCard && products.length > 0 && (
                  <div className="mt-5 text-[10px] uppercase tracking-[0.4em] text-[#b8935a]">
                    {products.length}{" "}
                    {products.length === 1 ? t.piece : t.pieces}
                  </div>
                )}
              </header>

              {/* Gift Card chapter — special CTA instead of product grid */}
              {active?._isGiftCard ? (
                <div className="max-w-2xl mx-auto text-center py-10">
                  <Link
                    href="/giftcard"
                    className="group inline-flex items-center gap-3 text-[#1a1410] hover:text-[#7a5a3a] transition-colors"
                  >
                    <span className="text-[11px] uppercase tracking-[0.3em]">
                      {t.giftCardCta}
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
                  </Link>
                </div>
              ) : products.length === 0 ? (
                /* Empty state */
                <div className="max-w-md mx-auto text-center py-16">
                  <Ornament width={70} />
                  <h3
                    className="mt-6 font-serif italic text-[#1a1410] leading-[1.1]"
                    style={{ fontSize: "clamp(1.6rem, 2.6vw, 2rem)" }}
                  >
                    {t.emptyTitle}
                  </h3>
                  <p className="mt-4 text-[#6b5a48] font-light leading-[1.75]">
                    {t.emptyBody}
                  </p>
                </div>
              ) : (
                /* Product grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14 md:gap-y-20">
                  {(() => {
                    const renderCard = (product, idx, dragHandleProps) => (
                      <motion.article
                        key={product.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.55,
                          ease: EASE,
                          delay: idx * 0.035,
                        }}
                        onClick={() => handleProductClick(product)}
                        className={`group cursor-pointer ${
                          clickedProduct === product.id ? "opacity-80" : ""
                        } ${product.is_hidden ? "opacity-60" : ""}`}
                      >
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ede4d1] rounded-sm">
                          <Image
                            src={
                              product.image || "https://placehold.co/600x750"
                            }
                            alt={product.name}
                            fill
                            className={`object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] ${
                              product.sold_out ? "grayscale opacity-80" : ""
                            }`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#2b1f15]/0 group-hover:to-[#2b1f15]/20 transition-colors duration-700" />

                          {product.sold_out && (
                            <SoldOutStamp size="md" language={language} />
                          )}

                          {/* admin chrome on top of the image */}
                          {isAdmin && (
                            <>
                              <AdminProductBadges product={product} />
                              <AdminProductOverlay
                                product={product}
                                onChange={updateProductInState}
                                dragHandleProps={dragHandleProps}
                              />
                            </>
                          )}

                          {/* hover chip */}
                          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#f7f1e7] opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                            <span className="drop-shadow">{t.open}</span>
                            <svg
                              width="16"
                              height="10"
                              viewBox="0 0 14 10"
                              fill="none"
                            >
                              <path
                                d="M1 5h12M9 1l4 4-4 4"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          {clickedProduct === product.id && (
                            <div className="absolute inset-0 bg-[#2b1f15]/40 backdrop-blur-sm flex items-center justify-center z-10">
                              <div className="h-7 w-7 border-2 border-[#f7f1e7]/30 border-t-[#f7f1e7] rounded-full animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="mt-5">
                          <h3
                            className="font-serif italic text-[#1a1410] leading-[1.2] group-hover:text-[#7a5a3a] transition-colors duration-300"
                            style={{
                              fontSize: "clamp(1.1rem, 1.35vw, 1.25rem)",
                            }}
                          >
                            {product.name}
                          </h3>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="h-px w-5 bg-[#b8935a]/60" />
                            <span className="font-serif italic text-[#7a5a3a] tracking-wide">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    );

                    if (!isAdmin) {
                      return products.map((p, i) => renderCard(p, i));
                    }
                    return (
                      <SortableList
                        items={products}
                        setItems={(next) =>
                          setCategoriesState((prev) =>
                            prev.map((c) =>
                              c.id === active?.id
                                ? { ...c, products: next }
                                : c
                            )
                          )
                        }
                        onPersist={persistProductOrder}
                        strategy="rect"
                        idKey="id"
                      >
                        {(product) => {
                          const idx = products.findIndex(
                            (p) => p.id === product.id
                          );
                          return (
                            <SortableItem key={product.id} id={product.id}>
                              {({ handleProps }) =>
                                renderCard(product, idx, handleProps)
                              }
                            </SortableItem>
                          );
                        }}
                      </SortableList>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ═══ Whisper footer ═══ */}
        <div className="relative pb-24 md:pb-32">
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <Ornament width={90} className="text-[#b8935a] mx-auto block" />
            <p
              className="mt-7 font-serif italic text-[#7a5a3a] leading-[1.4]"
              style={{ fontSize: "clamp(1.2rem, 2vw, 1.7rem)" }}
            >
              &ldquo; {t.whisper} &rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DARK VALUES INTERLUDE (kept)
          ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-[#1a1410] text-[#f0ebe3]"
        data-navbar-theme="dark"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 h-[420px] w-[420px] rounded-full bg-[#ff914d] opacity-[0.05] blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 -right-20 h-[420px] w-[420px] rounded-full bg-[#c9b89e] opacity-[0.04] blur-[140px]"
        />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-10 bg-[#ff914d]/60" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]">
              {language === "is" ? "Leiðarljós" : "Our Guide"}
            </span>
            <span className="h-px w-10 bg-[#ff914d]/60" />
          </div>
          <h3
            className="font-serif italic text-[#f0ebe3] leading-[1.1] mb-4"
            style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.8rem)" }}
          >
            {t.ourValues}.
          </h3>
          <div className="flex justify-center mt-10">
            <Ornament className="text-[#ff914d]/70" width={90} />
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14 text-left">
            {[
              { label: t.valueOne, body: t.valueOneBody, n: "I" },
              { label: t.valueTwo, body: t.valueTwoBody, n: "II" },
              { label: t.valueThree, body: t.valueThreeBody, n: "III" },
            ].map((v) => (
              <div key={v.n} className="flex flex-col">
                <span
                  className="font-serif italic text-[#ff914d]/60 leading-none mb-5"
                  style={{ fontSize: "clamp(2rem, 2.6vw, 2.6rem)" }}
                >
                  {v.n}
                </span>
                <h4 className="font-serif italic text-[#f0ebe3] text-xl md:text-2xl mb-3">
                  {v.label}
                </h4>
                <div className="h-px w-10 bg-[#ff914d]/50 mb-4" />
                <p className="text-[#c4b8aa] font-light text-[14px] leading-[1.85]">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
    </Wrapper>
  );
};

export default ListCategories;
