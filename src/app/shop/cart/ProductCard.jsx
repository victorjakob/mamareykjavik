"use client";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/util/IskFormat";

export default function ProductCard({
  item,
  cartItems,
  onRemove,
  onUpdateQuantity,
}) {
  const { language } = useLanguage();

  const translations = {
    en: {
      unitPrice: "Each",
      total: "Line",
      decrease: "Decrease quantity",
      increase: "Increase quantity",
      remove: "Remove",
    },
    is: {
      unitPrice: "Stk",
      total: "Lína",
      decrease: "Minnka magn",
      increase: "Auka magn",
      remove: "Fjarlægja",
    },
  };

  const t = translations[language];

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      onRemove(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const lineTotal = item.products.price * item.quantity;

  return (
    <article className="group relative py-7 first:pt-2">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        {/* Image — soft paper-framed thumbnail */}
        <div className="flex-shrink-0 relative w-full sm:w-28 h-40 sm:h-32 overflow-hidden bg-[#ede4d1] rounded-sm">
          <Image
            src={item.products.image}
            alt={item.products.name}
            fill
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, 112px"
          />
        </div>

        {/* Details */}
        <div className="flex-grow min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <h3
              className="font-serif italic text-[#1a1410] leading-[1.2]"
              style={{ fontSize: "clamp(1.15rem, 1.5vw, 1.35rem)" }}
            >
              {item.products.name}
            </h3>

            {/* Remove — faint pencil mark */}
            <button
              onClick={() => handleQuantityChange(0)}
              className="flex-shrink-0 text-[10px] uppercase tracking-[0.3em] text-[#b8935a]/70 hover:text-[#7a5a3a] transition-colors pt-1.5"
              aria-label={t.remove}
            >
              <span className="hidden sm:inline">{t.remove}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Unit price */}
          <div className="mt-2 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-[#6b5a48]/80">
            <span className="h-px w-5 bg-[#b8935a]/50" />
            <span>
              {t.unitPrice} · {formatPrice(item.products.price)}
            </span>
          </div>

          {/* Controls row */}
          <div className="mt-5 flex items-end justify-between gap-4 flex-wrap">
            {/* Understated quantity stepper */}
            <div className="inline-flex items-center border-b border-[#1a1410]/25">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center text-[#1a1410] hover:text-[#7a5a3a] transition-colors text-lg font-light"
                aria-label={t.decrease}
              >
                −
              </button>
              <span className="w-10 text-center font-serif italic text-[#1a1410] text-base leading-8">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-[#1a1410] hover:text-[#7a5a3a] transition-colors text-lg font-light"
                aria-label={t.increase}
              >
                +
              </button>
            </div>

            {/* Line total — italic sepia flourish */}
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#b8935a]">
                {t.total}
              </div>
              <div
                className="mt-1 font-serif italic text-[#7a5a3a]"
                style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.25rem)" }}
              >
                {formatPrice(lineTotal)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
