"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const baseReviews = [
  {
    id: "cozy-vegan-lunch",
    title: "A cozy and delicious vegan lunch",
    quote:
      "We had lunch at Mama and it was absolutely delicious. In a city with very few vegan or vegetarian options, this place felt like a hidden gem. The atmosphere is cozy and calm, perfect for a relaxed lunch and to warm up while feeling at home. Meals were beautifully prepared and served quickly. We felt genuinely welcomed throughout our visit.",
    visit: "Feb 2026 • Couples",
  },
  {
    id: "amazing-people",
    title: "Amazing people, incredible food, 10/10!",
    quote:
      "Absolutely incredible. The team is wonderful and very friendly, and they have created a relaxing environment without making guests feel rushed. The food was delicious, fresh, all vegan and exceptional. We tried garlic naan, hummus with sourdough and the West African stew. Pricing felt fair for the area and portions were generous. First place we will revisit next time in Reykjavik.",
    visit: "Feb 2026 • Friends",
  },
  {
    id: "perfect-setting",
    title: "Delicious food in the perfect setting",
    quote:
      "The curries and stews here are just delicious. The West Africa dish was stunning and the cheesecake was excellent. Service and setting were also perfect. We returned again during our trip.",
    visit: "Feb 2026 • Couples",
  },
  {
    id: "great-vibes",
    title: "Delicious food and great vibes",
    quote:
      "This little gem is heavenly, from the calm vibe and friendly staff to the stews and naans full of flavor. The African stew was the winner for us. Recommended for anyone wanting a unique food experience.",
    visit: "Feb 2026 • Couples",
  },
  {
    id: "simply-amazing",
    title: "Simply Amazing Vegan Food",
    quote:
      "Mama Vegan Restaurant in Reykjavik deserves special recognition for excellent food and an outstanding vegan dining experience.",
    visit: "Feb 2026 • Friends",
  },
  {
    id: "gastronomic-universe",
    title: "Gastronomic Universe",
    quote:
      "This wasn't just a meal, it felt like a full gastronomic experience. Every detail was balanced and thoughtful. You can feel the respect for ingredients, the love for cooking, and the intention to create an experience. Service was warm, smiling and genuinely attentive. I left feeling grateful and amazed.",
    visit: "Feb 2026 • Friends",
  },
  {
    id: "went-back-three-times",
    title: "Went back three times!",
    quote:
      "Such a great spot. The entrance is not obvious at first, but once inside we were very impressed. Staff were lovely, atmosphere was cozy, and the food was fresh and delicious with generous portions. One of the best vegan restaurants I have found on my travels.",
    visit: "Jan 2026 • Couples",
  },
  {
    id: "best-vegan",
    title: "Best Vegan! From a meat eater.",
    quote:
      "Food was fantastic. We did not know it was vegan before arriving, but everything we tried was spectacular. Great service, fantastic atmosphere, and delicious food. Excellent quality and quantity for Iceland.",
    visit: "Oct 2025 • Couples",
  },
  {
    id: "gem-in-city",
    title: "A gem in the city",
    quote:
      "A lovely cozy restaurant tucked away from the main street. Strong plant-based menu, generous portions and friendly staff. A little gem and very reasonably priced for the city.",
    visit: "Jan 2026 • Family",
  },
  {
    id: "chili-must",
    title: "Chili here is a must, vegan or not!",
    quote:
      "The chili sin carne and dhal a la mama are divine. Very friendly atmosphere with delicious food to match.",
    visit: "Dec 2025 • Couples",
  },
];

const reviews = {
  en: baseReviews,
  is: baseReviews,
};

const translations = {
  en: {
    eyebrow: "From the table",
    title: "What guests love most",
    subtitle: "Kind words shared after a meal with us.",
    cta: "See more reviews",
    previous: "Previous review",
    next: "Next review",
    readMore: "Read more",
    showLess: "Show less",
    sourceLabel: "TripAdvisor",
  },
  is: {
    eyebrow: "Frá borðinu",
    title: "Það sem gestir elska mest",
    subtitle: "Hlý orð frá gestum eftir máltíð hjá okkur.",
    cta: "Sjá fleiri umsagnir",
    previous: "Fyrri umsögn",
    next: "Næsta umsögn",
    readMore: "Lesa meira",
    showLess: "Sýna minna",
    sourceLabel: "TripAdvisor",
  },
};

const PREVIEW_CHARS = 260;

function Stars() {
  return (
    <div
      className="tracking-[0.18em] text-[#ff914d]/90 text-sm"
      aria-label="5 stars"
    >
      ★★★★★
    </div>
  );
}

function ReviewCard({ item, expanded, onToggle, labels }) {
  const longText = item.quote.length > PREVIEW_CHARS;
  const visibleQuote =
    longText && !expanded
      ? `${item.quote.slice(0, PREVIEW_CHARS).trimEnd()}…`
      : item.quote;

  return (
    <article className="group relative flex h-full flex-col rounded-[1.35rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.5)] transition duration-300 hover:-translate-y-0.5 hover:border-[#ff914d]/25 hover:from-white/[0.09] hover:to-white/[0.04]">
      <Stars />
      <h3 className="mt-4 font-cormorant italic font-light text-[1.35rem] sm:text-[1.5rem] leading-snug text-[#f5efe6]">
        {item.title}
      </h3>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[#b5a89a]">
        &ldquo;{visibleQuote}&rdquo;
      </p>
      {longText ? (
        <button
          type="button"
          onClick={onToggle}
          className="mt-3 self-start text-[11px] uppercase tracking-[0.18em] text-[#ff914d] transition-colors hover:text-[#ffa566]"
        >
          {expanded ? labels.showLess : labels.readMore}
        </button>
      ) : null}
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4 text-[11px] tracking-wide text-[#8a7e72]">
        <span className="uppercase tracking-[0.16em] text-[#c4b8aa]/90">
          {labels.sourceLabel}
        </span>
        <span>{item.visit}</span>
      </div>
    </article>
  );
}

export default function TripadvisorReviews() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const list = reviews[language] || reviews.en;
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [expandedMap, setExpandedMap] = useState({});

  const looped = useMemo(() => [...list, ...list, ...list], [list]);

  const getCardWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    return el.clientWidth / visibleCount;
  }, [visibleCount]);

  const jumpToMiddleBand = useCallback(() => {
    const el = scrollRef.current;
    const cardWidth = getCardWidth();
    if (!el || !cardWidth) return;
    el.scrollTo({ left: list.length * cardWidth, behavior: "auto" });
  }, [getCardWidth, list.length]);

  const scrollByStep = useCallback(
    (direction) => {
      const el = scrollRef.current;
      const cardWidth = getCardWidth();
      if (!el || !cardWidth) return;
      setExpandedMap({});
      el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    },
    [getCardWidth]
  );

  const next = useCallback(() => scrollByStep(1), [scrollByStep]);
  const prev = useCallback(() => scrollByStep(-1), [scrollByStep]);

  const goTo = useCallback(
    (targetIdx) => {
      const el = scrollRef.current;
      const cardWidth = getCardWidth();
      if (!el || !cardWidth) return;
      const currentAbsolute = Math.round(el.scrollLeft / cardWidth);
      const currentLogical = ((currentAbsolute % list.length) + list.length) % list.length;
      let delta = targetIdx - currentLogical;
      if (delta > list.length / 2) delta -= list.length;
      if (delta < -list.length / 2) delta += list.length;
      el.scrollBy({ left: delta * cardWidth, behavior: "smooth" });
    },
    [getCardWidth, list.length]
  );

  const toggleExpanded = useCallback((id) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  useEffect(() => {
    setExpandedMap({});
  }, [language]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const apply = () => setVisibleCount(media.matches ? 3 : 1);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    jumpToMiddleBand();
  }, [jumpToMiddleBand, language, visibleCount]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      const cardWidth = getCardWidth();
      if (!el || !cardWidth) return;
      const totalBandWidth = list.length * cardWidth;
      const left = el.scrollLeft;
      if (left < totalBandWidth * 0.5) {
        el.scrollLeft = left + totalBandWidth;
      } else if (left > totalBandWidth * 2.5) {
        el.scrollLeft = left - totalBandWidth;
      }
      const absolute = Math.round(el.scrollLeft / cardWidth);
      const logical = ((absolute % list.length) + list.length) % list.length;
      setActiveIndex(logical);
    });
  }, [getCardWidth, list.length]);

  return (
    <section className="relative overflow-hidden py-20 sm:py-24 md:py-28">
      {/* Soft warm atmosphere so it doesn't read as flat black chrome */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255,145,77,0.07) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(196,106,42,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto mb-12 sm:mb-16 max-w-2xl text-center px-2 sm:px-4">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#ff914d]/55" />
            <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-[0.32em] text-[#ff914d]">
              {t.eyebrow}
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#ff914d]/55" />
          </div>
          <h2
            className="font-cormorant italic font-light text-[#f5efe6] leading-[1.08] text-balance"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}
          >
            {t.title}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#a09488] sm:text-[15px]">
            {t.subtitle}
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={prev}
            aria-label={t.previous}
            className="absolute left-1 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#1a1510]/70 text-white/65 backdrop-blur-sm transition hover:border-[#ff914d]/40 hover:bg-white/[0.1] hover:text-white active:scale-95 sm:left-2 md:-left-5"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t.next}
            className="absolute right-1 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#1a1510]/70 text-white/65 backdrop-blur-sm transition hover:border-[#ff914d]/40 hover:bg-white/[0.1] hover:text-white active:scale-95 sm:right-2 md:-right-5"
          >
            →
          </button>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="mx-0 flex snap-x snap-mandatory gap-5 overflow-x-auto px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {looped.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="min-w-0 shrink-0 basis-full snap-start md:basis-[calc((100%-2.5rem)/3)]"
              >
                <ReviewCard
                  item={item}
                  expanded={!!expandedMap[item.id]}
                  onToggle={() => toggleExpanded(item.id)}
                  labels={t}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {list.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Go to review ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === idx ? "w-6 bg-[#ff914d]" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] tracking-wide text-[#8a7e72] md:hidden">
            Swipe to browse
          </p>
        </div>

        <div className="mt-12 sm:mt-14 text-center">
          <a
            href={language === "is" ? "/is/reviews" : "/reviews"}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-7 py-3 text-[11px] uppercase tracking-[0.2em] text-[#f0ebe3] transition hover:border-[#ff914d]/40 hover:bg-white/[0.08]"
          >
            {t.cta}
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
