"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/util/IskFormat";
import { AdminProvider } from "./admin/AdminContext";
import AdminBar from "./admin/AdminBar";
import AdminCategoryOverlay from "./admin/AdminCategoryOverlay";
import AdminProductOverlay, {
  AdminProductBadges,
} from "./admin/AdminProductOverlay";
import { SortableList, SortableItem } from "./admin/Sortable";
import SoldOutStamp from "./admin/SoldOutStamp";

const EASE = [0.22, 1, 0.36, 1];

function PaperTexture() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
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
  const [clickedProduct, setClickedProduct] = useState(null);

  const [categoriesState, setCategoriesState] = useState(initialCategories);
  useEffect(() => {
    setCategoriesState(initialCategories);
  }, [initialCategories]);

  // Gift card is a separate module — not a category door
  const categories = useMemo(
    () => (categoriesState || []).filter((c) => !c?._isGiftCard),
    [categoriesState]
  );

  // One category (e.g. only cacao) → show products on the shop home.
  // Multiple categories → show doors into each.
  const singleCategory = categories.length === 1 ? categories[0] : null;
  const products = singleCategory?.products || [];

  const translations = {
    en: {
      eyebrow: "The Shop",
      title: "Goods from Mama",
      lede: "Small-batch pieces from our table — starting with ceremonial cacao.",
      ledeMulti:
        "Cacao, kitchen goods, and gifts — small-batch pieces we use and love ourselves.",
      browse: "Browse",
      productsLabel: "Products",
      pieces: "products",
      piece: "product",
      open: "Browse",
      view: "View",
      empty: "Nothing in the shop right now.",
      emptyBody: "Check back soon — we’re restocking.",
      giftEyebrow: "Gift card",
      giftTitle: "Give Mama as a gift",
      giftBody:
        "A digital gift card for meals, cacao, and nights at our table — easy to send by email.",
      giftCta: "Buy a gift card",
      note1Title: "From our kitchen",
      note1Body: "Things we cook with, pour, and put on the table every day.",
      note2Title: "Small batches",
      note2Body: "Limited runs, chosen carefully — not mass retail.",
      note3Title: "Supports the house",
      note3Body: "Sales help keep Mama’s table, events, and community going.",
    },
    is: {
      eyebrow: "Verslunin",
      title: "Vörur frá Mama",
      lede: "Smáframleitt frá borðinu okkar — byrjar á ceremonial kakó.",
      ledeMulti:
        "Kakó, eldhúsvörur og gjafir — smáframleitt sem við notum og elskum sjálf.",
      browse: "Skoða",
      productsLabel: "Vörur",
      pieces: "vörur",
      piece: "vara",
      open: "Skoða",
      view: "Skoða",
      empty: "Ekkert í versluninni núna.",
      emptyBody: "Kíktu aftur fljótlega — við erum að fylla á.",
      giftEyebrow: "Gjafakort",
      giftTitle: "Gefðu Mama í gjöf",
      giftBody:
        "Stafrænt gjafakort fyrir máltíðir, kakó og kvöld á borðinu okkar — auðvelt að senda í tölvupósti.",
      giftCta: "Kaupa gjafakort",
      note1Title: "Úr eldhúsinu",
      note1Body:
        "Hlutir sem við eldum með, hellum og setjum á borðið á hverjum degi.",
      note2Title: "Smáframleitt",
      note2Body:
        "Takmarkaðar lotur, valdar af kostgæfni — ekki fjöldaframleiðsla.",
      note3Title: "Styður húsið",
      note3Body:
        "Sala hjálpar til við að halda borði Mama, viðburðum og samfélagi gangandi.",
    },
  };

  const t = translations[language] || translations.en;

  const persistCategoryOrder = (next) => {
    const items = next.map((c, idx) => ({ id: c.id, order: idx + 1 }));
    fetch("/api/admin/store/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).catch((err) => console.error("category reorder failed", err));
  };

  const persistProductOrder = (next) => {
    const items = next.map((p, idx) => ({ id: p.id, order: idx + 1 }));
    fetch("/api/admin/store/products/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).catch((err) => console.error("product reorder failed", err));
  };

  const updateCategoryInState = (next) => {
    setCategoriesState((prev) =>
      prev.map((c) => (c.id === next.id ? { ...c, ...next } : c))
    );
  };

  const updateProductInState = (next) => {
    if (!singleCategory) return;
    setCategoriesState((prev) =>
      prev.map((c) =>
        c.id === singleCategory.id
          ? {
              ...c,
              products: (c.products || []).map((p) =>
                p.id === next.id ? { ...p, ...next } : p
              ),
            }
          : c
      )
    );
  };

  const handleProductClick = (product) => {
    if (!singleCategory) return;
    setClickedProduct(product.id);
    requestAnimationFrame(() => {
      router.push(`/shop/${singleCategory.slug}/${product.slug}`);
    });
  };

  const Wrapper = ({ children }) =>
    isAdmin ? (
      <AdminProvider>
        <AdminBar />
        {children}
      </AdminProvider>
    ) : (
      <>{children}</>
    );

  const renderCategoryCard = (cat, idx, dragHandleProps) => {
    const count = cat.products?.length || 0;
    const href = `/shop/${cat.slug}`;

    return (
      <motion.div
        key={cat.id}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: EASE,
          delay: Math.min(idx * 0.06, 0.3),
        }}
        className={`relative ${cat.is_hidden ? "opacity-55" : ""}`}
      >
        <Link
          href={href}
          className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#1a1510] ring-1 ring-[#1a1410]/10 shadow-[0_16px_40px_-28px_rgba(26,20,16,0.45)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff914d]"
        >
          <div className="relative aspect-[5/4] overflow-hidden bg-[#2a2218]">
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#2a2218] to-[#1a1510]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510] via-[#1a1510]/25 to-transparent" />
          </div>

          <div className="flex flex-1 flex-col px-5 py-5 md:px-6 md:py-6">
            <h2 className="font-cormorant italic font-light text-[#f5efe6] text-[1.65rem] md:text-[1.85rem] leading-tight capitalize">
              {cat.name}
            </h2>
            {cat.description ? (
              <p className="mt-2 text-sm text-[#b5a89a] leading-relaxed line-clamp-2">
                {cat.description}
              </p>
            ) : null}
            <div className="mt-auto pt-5 flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#a09488]">
                {count} {count === 1 ? t.piece : t.pieces}
                {cat.is_hidden ? " · hidden" : ""}
              </span>
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#ff914d] transition-all duration-300 group-hover:gap-2.5">
                {t.open}
                <span aria-hidden>→</span>
              </span>
            </div>
          </div>
        </Link>

        {isAdmin && (
          <div className="absolute top-3 right-3 z-10">
            <AdminCategoryOverlay
              category={cat}
              dragHandleProps={dragHandleProps}
              onChange={updateCategoryInState}
            />
          </div>
        )}
      </motion.div>
    );
  };

  const renderProductCard = (product, idx, dragHandleProps) => (
    <motion.article
      key={product.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: EASE,
        delay: Math.min(idx * 0.04, 0.28),
      }}
      onClick={() => handleProductClick(product)}
      className={`group cursor-pointer ${
        clickedProduct === product.id ? "opacity-80" : ""
      } ${product.is_hidden ? "opacity-60" : ""}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ede4d1] rounded-sm">
        <Image
          src={product.image || "https://placehold.co/600x750"}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.04] ${
            product.sold_out ? "grayscale opacity-80" : ""
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#2b1f15]/0 group-hover:to-[#2b1f15]/20 transition-colors duration-700" />

        {product.sold_out && (
          <SoldOutStamp size="md" language={language} />
        )}

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

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#f7f1e7] opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
          <span className="drop-shadow">{t.view}</span>
          <span aria-hidden>→</span>
        </div>

        {clickedProduct === product.id && (
          <div className="absolute inset-0 bg-[#2b1f15]/40 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="h-7 w-7 border-2 border-[#f7f1e7]/30 border-t-[#f7f1e7] rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="mt-5">
        <h2
          className="font-cormorant italic text-[#1a1410] leading-[1.2] group-hover:text-[#7a5a3a] transition-colors duration-300"
          style={{ fontSize: "clamp(1.1rem, 1.35vw, 1.25rem)" }}
        >
          {product.name}
        </h2>
        <div className="mt-2 flex items-center gap-3">
          <span className="h-px w-5 bg-[#b8935a]/60" />
          <span className="font-cormorant italic text-[#7a5a3a] tracking-wide">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </motion.article>
  );

  return (
    <Wrapper>
      <main className="relative overflow-hidden">
        {/* ── Compact dark hero ─────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden bg-[#1a1410] text-[#f0ebe3]"
          data-navbar-theme="dark"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-[320px] w-[70vw] max-w-[720px] rounded-full bg-[#ff914d] opacity-[0.07] blur-[110px]"
          />
          <div className="relative max-w-3xl mx-auto px-6 pt-28 md:pt-32 pb-10 md:pb-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="h-px w-7 bg-[#ff914d]/50" />
                <span className="text-[10px] uppercase tracking-[0.34em] text-[#ff914d]">
                  {t.eyebrow}
                </span>
                <span className="h-px w-7 bg-[#ff914d]/50" />
              </div>
              <h1
                className="font-cormorant italic font-light text-[#f5efe6] leading-[1.08]"
                style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
              >
                {t.title}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-[#b5a89a] text-sm md:text-[15px] leading-relaxed font-light">
                {singleCategory ? t.lede : t.ledeMulti}
              </p>
              {isAdmin && singleCategory && (
                <div className="mt-5 flex justify-center">
                  <AdminCategoryOverlay
                    category={singleCategory}
                    onChange={updateCategoryInState}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Gift card (subtle) + products / category doors ──────────── */}
        <section
          className="relative bg-[#f7f1e7] text-[#1a1410] overflow-hidden"
          data-navbar-theme="light"
        >
          <PaperTexture />
          <div className="relative max-w-6xl mx-auto px-6 lg:px-10 pt-10 md:pt-12 pb-16 md:pb-20">
            {/* Quiet gift strip — sits above the shelf */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.08 }}
              className="mb-12 md:mb-14"
            >
              <Link
                href="/giftcard"
                className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-8 rounded-2xl border border-[#1a1410]/[0.1] bg-white/40 px-6 py-6 md:px-8 md:py-7 transition-colors duration-300 hover:border-[#c46a2a]/30 hover:bg-white/55"
              >
                <div className="min-w-0 max-w-xl">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-[#b8935a]">
                    {t.giftEyebrow}
                  </span>
                  <p className="mt-2 font-cormorant italic text-[#1a1410] text-[1.4rem] md:text-[1.65rem] leading-snug">
                    {t.giftTitle}
                  </p>
                  <p className="mt-2 text-sm md:text-[15px] text-[#5c4d3f] font-light leading-relaxed">
                    {t.giftBody}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 self-start sm:self-center rounded-full border border-[#1a1410]/15 bg-[#f7f1e7] px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-[#1a1410] transition-all duration-300 group-hover:border-[#c46a2a]/40 group-hover:text-[#7a5a3a]">
                  {t.giftCta}
                  <span aria-hidden>→</span>
                </span>
              </Link>
            </motion.div>

            {categories.length === 0 ? (
              <div className="text-center py-20 max-w-md mx-auto">
                <p className="font-cormorant italic text-2xl text-[#1a1410]">
                  {t.empty}
                </p>
                <p className="mt-3 text-sm text-[#6b5a48]">{t.emptyBody}</p>
              </div>
            ) : singleCategory ? (
              products.length === 0 ? (
                <div className="text-center py-20 max-w-md mx-auto">
                  <p className="font-cormorant italic text-2xl text-[#1a1410]">
                    {t.empty}
                  </p>
                  <p className="mt-3 text-sm text-[#6b5a48]">{t.emptyBody}</p>
                </div>
              ) : (
                <>
                <div className="mb-8 md:mb-10 flex items-baseline justify-between gap-4">
                  <h2 className="text-[11px] uppercase tracking-[0.28em] text-[#7a5a3a] font-medium">
                    {t.productsLabel}
                  </h2>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#b8935a]">
                    {products.length}{" "}
                    {products.length === 1 ? t.piece : t.pieces}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 md:gap-y-16">
                  {isAdmin ? (
                    <SortableList
                      items={products}
                      setItems={(next) => {
                        setCategoriesState((prev) =>
                          prev.map((c) =>
                            c.id === singleCategory.id
                              ? { ...c, products: next }
                              : c
                          )
                        );
                      }}
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
                              renderProductCard(product, idx, handleProps)
                            }
                          </SortableItem>
                        );
                      }}
                    </SortableList>
                  ) : (
                    products.map((p, i) => renderProductCard(p, i))
                  )}
                </div>
                </>
              )
            ) : (
              <>
                <div className="mb-8 md:mb-10">
                  <h2 className="text-[11px] uppercase tracking-[0.28em] text-[#7a5a3a] font-medium">
                    {t.browse}
                  </h2>
                </div>
                {isAdmin ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    <SortableList
                      items={categories}
                      setItems={(next) => {
                        setCategoriesState((prev) => {
                          const gift = (prev || []).find((c) => c?._isGiftCard);
                          return gift ? [...next, gift] : next;
                        });
                      }}
                      onPersist={persistCategoryOrder}
                      strategy="rect"
                      idKey="id"
                    >
                      {(cat) => {
                        const idx = categories.findIndex((c) => c.id === cat.id);
                        return (
                          <SortableItem key={cat.id} id={cat.id}>
                            {({ handleProps }) =>
                              renderCategoryCard(cat, idx, handleProps)
                            }
                          </SortableItem>
                        );
                      }}
                    </SortableList>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {categories.map((cat, idx) =>
                      renderCategoryCard(cat, idx)
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ── Short grounded notes ──────────────────────────────────────── */}
        <section
          className="relative bg-[#1a1410] text-[#f0ebe3]"
          data-navbar-theme="dark"
        >
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
              {[
                { title: t.note1Title, body: t.note1Body },
                { title: t.note2Title, body: t.note2Body },
                { title: t.note3Title, body: t.note3Body },
              ].map((note) => (
                <div key={note.title}>
                  <h3 className="font-cormorant italic text-[#f5efe6] text-xl md:text-2xl leading-tight">
                    {note.title}
                  </h3>
                  <div className="mt-3 h-px w-8 bg-[#ff914d]/45" />
                  <p className="mt-4 text-sm text-[#b5a89a] leading-relaxed font-light">
                    {note.body}
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
