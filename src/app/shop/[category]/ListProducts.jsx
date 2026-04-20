"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/util/IskFormat";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const EASE = [0.22, 1, 0.36, 1];

function Ornament({ width = 70 }) {
  return (
    <svg
      width={width}
      height="12"
      viewBox="0 0 80 12"
      fill="none"
      aria-hidden="true"
      className="text-[#b8935a] mx-auto block"
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

export default function ListProducts({ products, category }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [clickedProduct, setClickedProduct] = useState(null);

  const translations = {
    en: {
      back: "The Shop",
      separator: "·",
      eyebrow: "A Chapter",
      leadeFallback:
        "A small, quiet shelf — every piece chosen for the same reasons we put it on our table.",
      empty: "This shelf is resting.",
      emptyBody:
        "Nothing to pour today. Step back into the shop and wander a different aisle.",
      emptyBack: "Back to the shop",
      view: "Open",
      piece: "piece",
      pieces: "pieces",
    },
    is: {
      back: "Verslunin",
      separator: "·",
      eyebrow: "Kafli",
      leadeFallback:
        "Lítil, hljóðlát hilla — hver hlutur valinn af sömu ástæðum og við setjum hann á borðið.",
      empty: "Þessi hilla er í hvíld.",
      emptyBody:
        "Ekkert að hella í dag. Farðu aftur í verslunina og skoðaðu aðra hillu.",
      emptyBack: "Aftur í verslun",
      view: "Opna",
      piece: "hlutur",
      pieces: "hlutir",
    },
  };

  const t = translations[language];
  const prettyName = category.replace(/-/g, " ");

  return (
    <main className="relative overflow-hidden text-[#2b1f15] pt-28 md:pt-36">
      {/* Paper texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 left-1/2 -translate-x-1/2 w-[80vw] max-w-[900px] h-[420px] rounded-full bg-[#ff914d]/[0.045] blur-[130px]"
      />

      {/* ═══ HEADING ═══ */}
      <section className="relative pb-14 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.35em] text-[#b8935a] mb-8"
            aria-label="Breadcrumb"
          >
            <Link
              href="/shop"
              className="hover:text-[#7a5a3a] transition-colors"
            >
              {t.back}
            </Link>
            <span className="text-[#b8935a]/50">{t.separator}</span>
            <span className="text-[#7a5a3a] font-light tracking-[0.35em]">
              {prettyName}
            </span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-center"
          >
            <h1
              className="font-serif italic text-[#1a1410] leading-[0.98] capitalize"
              style={{ fontSize: "clamp(2.6rem, 7vw, 5.2rem)" }}
            >
              {prettyName}
            </h1>
            <div className="mt-8">
              <Ornament width={80} />
            </div>
            <p className="mx-auto mt-6 max-w-xl text-[#6b5a48] font-light italic leading-[1.75] text-sm md:text-base">
              {t.leadeFallback}
            </p>
            {products.length > 0 && (
              <div className="mt-6 text-[10px] uppercase tracking-[0.4em] text-[#b8935a]">
                {products.length}{" "}
                {products.length === 1 ? t.piece : t.pieces}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ═══ PRODUCTS ═══ */}
      <section className="relative pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {products.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16">
              <Ornament width={80} />
              <h2
                className="mt-8 font-serif italic text-[#1a1410] leading-[1.1]"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}
              >
                {t.empty}
              </h2>
              <p className="mt-4 text-[#6b5a48] font-light leading-[1.75]">
                {t.emptyBody}
              </p>
              <Link
                href="/shop"
                className="group mt-8 inline-flex items-center gap-3 text-[#1a1410] hover:text-[#7a5a3a] transition-colors"
              >
                <span className="text-[11px] uppercase tracking-[0.3em]">
                  {t.emptyBack}
                </span>
                <span className="h-px w-10 bg-[#1a1410] transition-all duration-500 group-hover:w-16 group-hover:bg-[#7a5a3a]" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14 md:gap-y-20">
              {products.map((product, idx) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: EASE, delay: idx * 0.04 }}
                  onClick={() => {
                    setClickedProduct(product.id);
                    requestAnimationFrame(() => {
                      router.push(`/shop/${category}/${product.slug}`);
                    });
                  }}
                  className={`group cursor-pointer ${
                    clickedProduct === product.id ? "opacity-80" : ""
                  }`}
                >
                  {/* Image — no boxed card, just the image on paper */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ede4d1] rounded-sm">
                    <Image
                      src={product.image || "https://placehold.co/600x750"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#2b1f15]/0 group-hover:to-[#2b1f15]/20 transition-colors duration-700" />

                    {/* hover chip */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#f7f1e7] opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                      <span className="drop-shadow">{t.view}</span>
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

                  {/* Info */}
                  <div className="mt-5">
                    <h2
                      className="font-serif italic text-[#1a1410] leading-[1.2] group-hover:text-[#7a5a3a] transition-colors duration-300"
                      style={{ fontSize: "clamp(1.1rem, 1.35vw, 1.25rem)" }}
                    >
                      {product.name}
                    </h2>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="h-px w-5 bg-[#b8935a]/60" />
                      <span className="font-serif italic text-[#7a5a3a] tracking-wide">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
